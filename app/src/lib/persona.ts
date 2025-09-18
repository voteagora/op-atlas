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
}

export const personaClient = new PersonaClient(process.env.PERSONA_API_KEY)

async function* fetchGenerator<T>(
  client: PersonaClient,
  path: keyof PersonaClient,
  nextUrl?: string,
): AsyncGenerator<T[]> {
  let currentUrl = nextUrl

  do {
    const response = (await client[path as keyof PersonaClient](
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
