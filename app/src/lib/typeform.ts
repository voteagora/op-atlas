import {
  TypeformItem,
  WebhookPayload,
} from "@/app/api/webhook/addKYCTeam/route"

interface FormEntry {
  form_id: string | null
  kyc_team_id: string | null
  l2_address: string | null
  updated_at: string | null
  kyc_people: PersonInfo[]
  kyb_people: CompanyInfo[]
}

interface PersonInfo {
  firstName: string
  lastName: string
  email: string
}

interface CompanyInfo {
  firstName: string
  lastName: string
  email: string
  companyName: string
}

const isFormResponseEvent = (eventType: string): boolean =>
  eventType === "form_response"

const createBaseEntry = (item: TypeformItem): FormEntry => ({
  form_id: item.form_id ?? null,
  kyc_team_id: item.hidden?.kyc_team_id ?? null,
  l2_address: item.hidden?.l2_address ?? null,
  updated_at: item.submitted_at ?? null,
  kyc_people: [],
  kyb_people: [],
})

const getKybEmailCount = (answers: TypeformItem["answers"]): number => {
  const kybField = answers?.find(
    (answer) =>
      answer.field?.type === "number" && answer.field?.id === "gJ1tbRvmyWOs",
  )
  return kybField?.number || 0
}

const getPersonInfo = (
  answers: TypeformItem["answers"],
  currentIndex: number,
  foundKybField: boolean,
): { firstName: string; lastName: string; companyName?: string } => {
  const firstName =
    currentIndex >= 2 && answers?.[currentIndex - 2]?.field?.type === "text"
      ? answers[currentIndex - 2].text?.trim() || ""
      : ""

  const lastName =
    currentIndex >= 2 && answers?.[currentIndex - 1]?.field?.type === "text"
      ? answers[currentIndex - 1].text?.trim() || ""
      : ""

  const companyName =
    foundKybField && answers?.[currentIndex + 1]?.field?.type === "text"
      ? answers[currentIndex + 1].text?.trim()
      : undefined

  return { firstName, lastName, companyName }
}

const processEmailAnswer = (
  answer: NonNullable<TypeformItem["answers"]>[number],
  answers: TypeformItem["answers"],
  currentIndex: number,
  foundKybField: boolean,
): PersonInfo | CompanyInfo | null => {
  if (!answer.field?.type || answer.field.type !== "email" || !answer.email) {
    return null
  }

  const email = answer.email.toLowerCase().trim()
  if (!email) {
    throw new Error("Empty email detected in form submission")
  }

  const { firstName, lastName, companyName } = getPersonInfo(
    answers,
    currentIndex,
    foundKybField,
  )

  return companyName
    ? { firstName, lastName, email, companyName }
    : { firstName, lastName, email }
}

const processAnswers = (
  answers: TypeformItem["answers"] = [],
  numberOfKybEmails: number,
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
        numberOfKybEmails > 0,
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

function parseTypeformWebhook(
  webhookPayload: WebhookPayload,
): FormEntry | null {
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
  const { kycPeople, kybPeople } = processAnswers(
    item.answers,
    numberOfKybEmails,
  )

  validateResults(kycPeople, kybPeople, numberOfKybEmails)

  return {
    ...entry,
    kyc_people: kycPeople,
    kyb_people: kybPeople,
  }
}

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

/**
 * Save the form entry to your database
 * Replace this implementation with your database logic (e.g., Prisma, MongoDB, etc.)
 */
async function saveFormEntryToDatabase(formEntry: FormEntry): Promise<void> {
  // Example implementation using Prisma
  // const prisma = new PrismaClient();
  // await prisma.formResponse.upsert({
  //   where: { form_id: formEntry.form_id },
  //   update: formEntry,
  //   create: formEntry,
  // });

  console.log("Saving form entry to database:", formEntry)
  // Implement your database logic here
}
