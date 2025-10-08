import { processPersonaCases, processPersonaInquiries } from "./actions/kyc"

const PERSONA_API_URL = "https://app.withpersona.com"

export const inquiryStatusMap = {
  approved: "APPROVED",
  expired: "PENDING",
  pending: "PENDING",
  created: "PENDING",
  completed: "PENDING",
  declined: "REJECTED",
  needs_review: "PENDING",
} as const

export const caseStatusMap = {
  Approved: "APPROVED",
  Expired: "PENDING",
  Open: "PENDING",
  Created: "PENDING",
  Declined: "REJECTED",
  "Waiting on UBOs": "PENDING",
  "Ready for Review": "PENDING",
} as const

// Add a function to map case statuses to valid PersonaStatus enum values
export function mapCaseStatusToPersonaStatus(caseStatus: string): string {
  const status = caseStatus.toLowerCase()

  // Map to valid PersonaStatus enum values
  switch (status) {
    case "approved":
      return "approved"
    case "declined":
      return "declined"
    case "open":
    case "created":
    case "expired":
    case "waiting on ubos":
    case "ready for review":
      return "pending"
    default:
      console.warn(`Unknown case status: ${caseStatus}, defaulting to pending`)
      return "pending"
  }
}

export type PersonaInquiry = {
  id: string
  attributes: {
    status: string
    resolution: string
    "created-at": string
    "updated-at": string
    "started-at": string
    "expires-at": string
    "completed-at": string
    "failed-at": string
    "name-first": string
    "name-last": string
    "name-middle": string
    "email-address": string
    "reference-id": string
  }
}

export type PersonaCase = {
  id: string
  attributes: {
    status: string
    resolution: string
    "created-at": string
    "updated-at": string
    "started-at": string
    "resolved-at": string
    "reference-id": string
    fields: {
      "business-name": {
        type: string
        value: string
      }
      "form-filler-email-address": {
        type: string
        value: string
      }
    }
  }
  relationships: {
    inquiries: { data: { type: string; id: string }[] }
  }
}

type PersonaResponse<T> = {
  data: T[]
  links: {
    next: string
  }
}

type PersonaSingleResponse<T> = {
  data: T
}

type PersonaOneTimeLinkAttributes = {
  "expires-at"?: string
  [key: string]: unknown
}

type PersonaOneTimeLink = {
  id: string
  type: "inquiry/one-time-link"
  attributes?: PersonaOneTimeLinkAttributes
}

type PersonaOneTimeLinkMeta = {
  "one-time-link"?: string
  "one-time-link-short"?: string
  "expires-at"?: string
  [key: string]: unknown
}

type PersonaOneTimeLinkResponse = {
  data: PersonaOneTimeLink
  meta?: PersonaOneTimeLinkMeta
}

export type GeneratedPersonaOneTimeLink = {
  redirectUrl: string
  expiresAt?: string
}

class PersonaClient {
  constructor(private readonly apiKey?: string) {
    if (!apiKey) {
      console.warn("Persona API key not set")
    }
  }

  async getCases(nextUrl?: string): Promise<PersonaResponse<PersonaCase>> {
    const url = `${PERSONA_API_URL}${nextUrl || "/api/v1/cases"}`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    return response.json()
  }

  async getInquiries(
    nextUrl?: string,
  ): Promise<PersonaResponse<PersonaInquiry>> {
    const url = `${PERSONA_API_URL}${nextUrl || "/api/v1/inquiries"}`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    return response.json()
  }

  async getInquiryById(inquiryId: string): Promise<PersonaInquiry | null> {
    const apiKey = this.apiKey
    if (!apiKey) {
      console.warn("Persona API key not set")
      return null
    }

    try {
      const url = `${PERSONA_API_URL}/api/v1/inquiries/${inquiryId}`
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(
          `Failed to fetch inquiry: ${response.status} ${response.statusText}`,
        )
      }

      const data: PersonaSingleResponse<PersonaInquiry> = await response.json()
      return data.data
    } catch (error) {
      console.error(`Error fetching inquiry ${inquiryId}:`, error)
      return null
    }
  }

  /**
   * Create a new Persona Inquiry
   * @param referenceId - Unique reference ID to link inquiry to KYCUser/LegalEntity
   * @param templateId - Persona inquiry template ID
   * @returns Created inquiry object
   */
  async createInquiry(
    referenceId: string,
    templateId: string,
  ): Promise<PersonaInquiry> {
    if (!this.apiKey) {
      throw new Error("Persona API key not set")
    }

    try {
      const url = `${PERSONA_API_URL}/api/v1/inquiries`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Persona-Version": "2023-01-05",
        },
        body: JSON.stringify({
          data: {
            attributes: {
              "inquiry-template-id": templateId,
              "reference-id": referenceId,
            },
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Failed to create inquiry: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
        )
      }

      const data: PersonaSingleResponse<PersonaInquiry> = await response.json()
      console.log(
        `Created Persona inquiry ${data.data.id} for reference ${referenceId}`,
      )
      return data.data
    } catch (error) {
      console.error("Failed to create Persona inquiry:", error)
      throw error
    }
  }

  /**
   * Generate a one-time link (OTL) for an inquiry
   * OTLs expire and can only be used once, providing better security
   * @param inquiryId - Persona inquiry ID
   * @returns One-time link object with URL and expiration
   */
  async generateOneTimeLink(
    inquiryId: string,
  ): Promise<GeneratedPersonaOneTimeLink> {
    if (!this.apiKey) {
      throw new Error("Persona API key not set")
    }

    try {
      const url = `${PERSONA_API_URL}/api/v1/inquiries/${inquiryId}/generate-one-time-link`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Persona-Version": "2023-01-05",
        },
        body: JSON.stringify({
          data: {
            attributes: {},
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Failed to generate OTL: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
        )
      }

      const json: PersonaOneTimeLinkResponse = await response.json()
      const { data: otl, meta = {} } = json
      const linkCandidate =
        typeof meta["one-time-link"] === "string" &&
        meta["one-time-link"].trim().length > 0
          ? meta["one-time-link"]
          : typeof meta["one-time-link-short"] === "string" &&
              meta["one-time-link-short"].trim().length > 0
            ? meta["one-time-link-short"]
            : undefined

      if (!linkCandidate) {
        console.error(
          `Persona OTL response missing redirect link for inquiry ${inquiryId}`,
          json,
        )
        throw new Error("Persona OTL response missing link")
      }

      const expiresAt =
        (typeof meta["expires-at"] === "string" && meta["expires-at"]) ||
        (typeof otl.attributes?.["expires-at"] === "string"
          ? otl.attributes["expires-at"]
          : undefined)

      console.log(
        `Generated OTL for inquiry ${inquiryId}, expires at ${expiresAt ?? "unknown"}`,
      )

      return {
        redirectUrl: linkCandidate,
        expiresAt,
      }
    } catch (error) {
      console.error(`Failed to generate OTL for inquiry ${inquiryId}:`, error)
      throw error
    }
  }
}

export const personaClient = new PersonaClient(process.env.PERSONA_API_KEY)

type PersonaPaginatedMethod = {
  [K in keyof PersonaClient]: PersonaClient[K] extends (
    nextUrl?: string,
  ) => Promise<PersonaResponse<any>>
    ? K
    : never
}[keyof PersonaClient]

async function* fetchGenerator<T>(
  client: PersonaClient,
  path: PersonaPaginatedMethod,
  nextUrl?: string,
): AsyncGenerator<T[]> {
  let currentUrl = nextUrl

  do {
    const response = (await client[path](
      currentUrl || "",
    )) as PersonaResponse<T>

    const batch = response.data
    yield batch
    // Clear references to help garbage collection
    response.data = []
    batch.length = 0

    currentUrl = response.links.next
  } while (currentUrl)
}

export const getAndProcessPersonaCases = () => {
  return processPaginatedData(
    () => fetchGenerator<PersonaCase>(personaClient, "getCases"),
    processPersonaCases,
  )
}

export const getAndProcessPersonaInquiries = () => {
  return processPaginatedData(
    () => fetchGenerator<PersonaInquiry>(personaClient, "getInquiries"),
    processPersonaInquiries,
  )
}

async function processPaginatedData<T>(
  fetchPage: () => AsyncGenerator<T[]>,
  processBatch: (items: T[]) => Promise<void>,
) {
  const processingPromises: Promise<void>[] = []
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 2)

  for await (const batch of fetchPage()) {
    // Since data is sorted by created-at desc, we need to check the last item
    const lastItem = batch[batch.length - 1]
    const timestamp = (lastItem as any).attributes?.["created-at"]
    const isOldData = timestamp && new Date(timestamp) < oneMonthAgo

    processingPromises.push(processBatch([...batch]))

    if (isOldData) {
      break
    }
  }

  return Promise.all(processingPromises)
}
