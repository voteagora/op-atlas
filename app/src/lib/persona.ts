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
}

type PersonaResponse<T> = {
  data: T[]
  links: {
    next: string
  }
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
}

const personaClient = new PersonaClient(process.env.PERSONA_API_KEY)

async function* fetchGenerator<T>(
  client: PersonaClient,
  path: keyof PersonaClient,
  nextUrl?: string,
): AsyncGenerator<T[]> {
  let currentUrl = nextUrl

  do {
    const response = (await client[path as keyof PersonaClient](
      currentUrl,
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

  for await (const batch of fetchPage()) {
    processingPromises.push(processBatch([...batch]))
  }

  return Promise.all(processingPromises)
}
