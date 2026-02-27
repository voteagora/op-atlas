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
    next: string | null
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

const inquiryByIdCache = new Map<string, PersonaInquiry>()
const INQUIRY_CACHE_MAX_ITEMS = 20_000
const PERSONA_RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])
const MAX_PERSONA_RETRIES = 3

function clearInquiryCache() {
  inquiryByIdCache.clear()
}

function cacheInquiries(inquiries: PersonaInquiry[]) {
  for (const inquiry of inquiries) {
    if (!inquiry?.id) continue
    inquiryByIdCache.set(inquiry.id, inquiry)
  }

  if (inquiryByIdCache.size > INQUIRY_CACHE_MAX_ITEMS) {
    clearInquiryCache()
  }
}

function truncateForLogs(value: string, maxLength = 400): string {
  const normalized = value.replace(/\s+/g, " ").trim()
  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength)}...`
}

function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function parseRetryAfterSeconds(value: string | null): number | null {
  if (!value) return null

  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds
  }

  const asDateMs = Date.parse(value)
  if (Number.isNaN(asDateMs)) {
    return null
  }

  const deltaSeconds = Math.ceil((asDateMs - Date.now()) / 1000)
  return deltaSeconds > 0 ? deltaSeconds : 0
}

function getRetryDelayMs(response: Response, attempt: number): number {
  const retryAfterSeconds = parseRetryAfterSeconds(
    response.headers.get("retry-after"),
  )
  if (retryAfterSeconds !== null) {
    return retryAfterSeconds * 1000
  }

  // Exponential backoff with a small cap to keep cron bounded.
  return Math.min(500 * 2 ** attempt, 4000)
}

function shouldRetryStatus(status: number): boolean {
  return PERSONA_RETRYABLE_STATUS_CODES.has(status)
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

class PersonaClient {
  constructor(private readonly apiKey?: string) {
    if (!apiKey) {
      console.warn("Persona API key not set")
    }
  }

  private async getPaginated<T>(path: string): Promise<PersonaResponse<T>> {
    const apiKey = this.apiKey
    if (!apiKey) {
      throw new Error("Persona API key not set")
    }

    const url = `${PERSONA_API_URL}${path}`
    for (let attempt = 0; attempt <= MAX_PERSONA_RETRIES; attempt++) {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      const rawBody = await response.text()
      const parsed = safeParseJson(rawBody) as Record<string, unknown> | null

      if (!response.ok) {
        if (
          shouldRetryStatus(response.status) &&
          attempt < MAX_PERSONA_RETRIES
        ) {
          const delayMs = getRetryDelayMs(response, attempt)
          console.warn(
            `Persona request ${path} returned ${response.status}; retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_PERSONA_RETRIES})`,
          )
          await sleep(delayMs)
          continue
        }

        const errorDetails =
          parsed && Array.isArray(parsed.errors)
            ? truncateForLogs(JSON.stringify(parsed.errors))
            : truncateForLogs(rawBody || "<empty>")

        throw new Error(
          `Persona request failed for ${path}: ${response.status} ${response.statusText} - ${errorDetails}`,
        )
      }

      const data = parsed?.data
      const next = parsed?.links
        ? (parsed.links as { next?: unknown }).next
        : undefined

      if (!Array.isArray(data)) {
        throw new Error(
          `Persona response missing data array for ${path}: ${truncateForLogs(rawBody || "<empty>")}`,
        )
      }

      if (next !== undefined && next !== null && typeof next !== "string") {
        throw new Error(
          `Persona response has invalid links.next for ${path}: ${truncateForLogs(rawBody || "<empty>")}`,
        )
      }

      return {
        data: data as T[],
        links: {
          next: typeof next === "string" ? next : null,
        },
      }
    }

    throw new Error(
      `Persona request failed for ${path}: exhausted retry attempts`,
    )
  }

  async getCases(nextUrl?: string): Promise<PersonaResponse<PersonaCase>> {
    return this.getPaginated<PersonaCase>(nextUrl || "/api/v1/cases")
  }

  async getInquiries(
    nextUrl?: string,
  ): Promise<PersonaResponse<PersonaInquiry>> {
    return this.getPaginated<PersonaInquiry>(nextUrl || "/api/v1/inquiries")
  }

  async getInquiryById(inquiryId: string): Promise<PersonaInquiry | null> {
    const cachedInquiry = inquiryByIdCache.get(inquiryId)
    if (cachedInquiry) {
      return cachedInquiry
    }

    const apiKey = this.apiKey
    if (!apiKey) {
      console.warn("Persona API key not set")
      return null
    }

    try {
      const url = `${PERSONA_API_URL}/api/v1/inquiries/${inquiryId}`
      for (let attempt = 0; attempt <= MAX_PERSONA_RETRIES; attempt++) {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            return null
          }
          if (
            shouldRetryStatus(response.status) &&
            attempt < MAX_PERSONA_RETRIES
          ) {
            const delayMs = getRetryDelayMs(response, attempt)
            console.warn(
              `Persona inquiry ${inquiryId} returned ${response.status}; retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_PERSONA_RETRIES})`,
            )
            await sleep(delayMs)
            continue
          }
          throw new Error(
            `Failed to fetch inquiry: ${response.status} ${response.statusText}`,
          )
        }

        const data: PersonaSingleResponse<PersonaInquiry> = await response.json()
        if (data?.data?.id) {
          inquiryByIdCache.set(data.data.id, data.data)
        }
        return data.data
      }
    } catch (error) {
      console.error(`Error fetching inquiry ${inquiryId}:`, error)
      return null
    }

    return null
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
    fields?: Record<string, string>,
  ): Promise<PersonaInquiry> {
    if (!this.apiKey) {
      throw new Error("Persona API key not set")
    }

    try {
      const url = `${PERSONA_API_URL}/api/v1/inquiries`
      const attributes: Record<string, unknown> = {
        "inquiry-template-id": templateId,
        "reference-id": referenceId,
      }

      if (fields && Object.keys(fields).length > 0) {
        attributes.fields = fields
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Persona-Version": "2023-01-05",
        },
        body: JSON.stringify({
          data: { attributes },
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
    if (path === "getInquiries") {
      cacheInquiries(batch as unknown as PersonaInquiry[])
    }
    yield batch

    currentUrl = response.links.next || undefined
  } while (currentUrl)
}

export const getAndProcessPersonaCases = () => {
  return processPaginatedData(
    () => fetchGenerator<PersonaCase>(personaClient, "getCases"),
    processPersonaCases,
  )
}

export const getAndProcessPersonaInquiries = () => {
  clearInquiryCache()
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
    if (batch.length === 0) {
      continue
    }

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
