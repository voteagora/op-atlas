import {
  TypeformItem,
  WebhookPayload,
} from "@/app/api/webhook/addKYCTeam/route"
import { addKYCTeamMembers } from "@/db/projects"

// Types
type FormEntry = {
  form_id: string | null
  kyc_team_id: string
  l2_address: string | null
  updated_at: string | null
  kyc_people: PersonInfo[]
  kyb_people: CompanyInfo[]
}

type PersonInfo = {
  firstName: string
  lastName: string
  email: string
}

type CompanyInfo = PersonInfo & {
  companyName: string
}

type Answer = NonNullable<TypeformItem["answers"]>[number]

// Constants
const KYB_FIELD_ID = "gJ1tbRvmyWOs" as const
const FIELD_TYPES = {
  EMAIL: "email",
  SHORT_TEXT: "short_text",
  NUMBER: "number",
} as const

// Validation
const isValidEmail = (email: string): boolean => {
  const trimmedEmail = email.toLowerCase().trim()
  return trimmedEmail.length > 0
}

const isValidPersonInfo = (info: {
  firstName: string
  lastName: string
}): boolean => {
  return info.firstName.length > 0 && info.lastName.length > 0
}

// Pure functions for data transformation
const isFormResponseEvent = (eventType: string): boolean =>
  eventType === "form_response"

const createBaseEntry = (item: TypeformItem): FormEntry => ({
  form_id: item.form_id ?? null,
  kyc_team_id: item.hidden?.kyc_team_id ?? "",
  l2_address: item.hidden?.l2_address ?? null,
  updated_at: item.submitted_at ?? null,
  kyc_people: [],
  kyb_people: [],
})

const findKybField = (answers: TypeformItem["answers"]): Answer | undefined =>
  answers?.find(
    (answer) =>
      answer.field?.type === FIELD_TYPES.NUMBER &&
      answer.field?.id === KYB_FIELD_ID,
  )

const getKybEmailCount = (answers: TypeformItem["answers"]): number =>
  findKybField(answers)?.number ?? 0

const getKybFieldIndex = (answers: TypeformItem["answers"]): number =>
  answers?.findIndex(
    (answer) =>
      answer.field?.type === FIELD_TYPES.NUMBER &&
      answer.field?.id === KYB_FIELD_ID,
  ) ?? -1

const extractTextFromAnswer = (answer: Answer | undefined): string =>
  answer?.field?.type === FIELD_TYPES.SHORT_TEXT
    ? answer.text?.trim() ?? ""
    : ""

const getPersonInfo = (
  answers: TypeformItem["answers"],
  currentIndex: number,
  kybEmailIndex: number,
): { firstName: string; lastName: string; companyName?: string } => {
  const firstName = extractTextFromAnswer(answers?.[currentIndex - 2])
  const lastName = extractTextFromAnswer(answers?.[currentIndex - 1])
  const companyName =
    kybEmailIndex < currentIndex
      ? extractTextFromAnswer(answers?.[currentIndex + 1])
      : undefined

  return { firstName, lastName, companyName }
}

const processEmailAnswer = (
  answer: Answer,
  answers: TypeformItem["answers"],
  currentIndex: number,
  kybEmailIndex: number,
): PersonInfo | CompanyInfo | null => {
  if (
    !answer.field?.type ||
    answer.field.type !== FIELD_TYPES.EMAIL ||
    !answer.email
  ) {
    return null
  }

  const email = answer.email.toLowerCase().trim()
  if (!isValidEmail(email)) {
    throw new Error("Invalid email detected in form submission")
  }

  const personInfo = getPersonInfo(answers, currentIndex, kybEmailIndex)
  if (!isValidPersonInfo(personInfo)) {
    throw new Error("Invalid person information detected in form submission")
  }

  return personInfo.companyName
    ? { ...personInfo, email, companyName: personInfo.companyName }
    : { firstName: personInfo.firstName, lastName: personInfo.lastName, email }
}

const processAnswers = (
  answers: TypeformItem["answers"] = [],
  numberOfKybEmails: number,
  kybEmailIndex: number,
): { kycPeople: PersonInfo[]; kybPeople: CompanyInfo[] } => {
  const result = answers.reduce<{
    kycPeople: PersonInfo[]
    kybPeople: CompanyInfo[]
  }>(
    (acc, answer, index) => {
      const personInfo = processEmailAnswer(
        answer,
        answers,
        index,
        kybEmailIndex,
      )
      if (!personInfo) return acc

      if ("companyName" in personInfo) {
        return {
          ...acc,
          kybPeople: [...acc.kybPeople, personInfo],
        }
      }

      return {
        ...acc,
        kycPeople: [...acc.kycPeople, personInfo],
      }
    },
    { kycPeople: [], kybPeople: [] },
  )

  return {
    kycPeople: result.kycPeople,
    kybPeople: result.kybPeople.slice(0, numberOfKybEmails),
  }
}

const validateResults = (
  kycPeople: PersonInfo[],
  kybPeople: CompanyInfo[],
  numberOfKybEmails: number,
): void => {
  if (kycPeople.length === 0) {
    throw new Error("No KYC emails found in form submission")
  }

  if (numberOfKybEmails > 0 && kybPeople.length === 0) {
    throw new Error(
      `Expected ${numberOfKybEmails} KYB emails but none were provided`,
    )
  }
}

// Main processing function
const parseTypeformWebhook = (
  webhookPayload: WebhookPayload,
): FormEntry | null => {
  if (!isFormResponseEvent(webhookPayload.event_type)) {
    console.warn(
      `Ignoring non-form_response event: ${webhookPayload.event_type}`,
    )
    return null
  }

  const item = webhookPayload.form_response
  const entry = createBaseEntry(item)

  if (!entry.kyc_team_id) {
    console.warn("Skipping webhook payload missing kyc_team_id")
    return null
  }

  const numberOfKybEmails = getKybEmailCount(item.answers)
  const kybEmailIndex = getKybFieldIndex(item.answers)
  const { kycPeople, kybPeople } = processAnswers(
    item.answers,
    numberOfKybEmails,
    kybEmailIndex,
  )

  validateResults(kycPeople, kybPeople, numberOfKybEmails)

  return {
    ...entry,
    kyc_people: kycPeople,
    kyb_people: kybPeople,
  }
}

// Database operations
const saveFormEntryToDatabase = async (formEntry: FormEntry): Promise<void> => {
  await addKYCTeamMembers({
    kycTeamId: formEntry.kyc_team_id,
    individuals: formEntry.kyc_people,
    businesses: formEntry.kyb_people,
  })
}

// Public API
export async function processTypeformWebhook(
  webhookPayload: WebhookPayload,
): Promise<FormEntry | null> {
  const formEntry = parseTypeformWebhook(webhookPayload)
  if (!formEntry) {
    return null
  }
  await saveFormEntryToDatabase(formEntry)
  return formEntry
}
