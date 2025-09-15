/*
  backfill-kyc.ts

  Goal:
  - Find all KYCUser entries whose expiry is within the last 13 months (<= now and >= now - 13 months)
  - Fetch Persona inquiries via Persona API client
  - Match KYCUser.email to Persona inquiry attributes["email-address"], using the latest inquiry per email
  - For matched users: update within a single reversible Prisma transaction:
    - status (map from persona inquiry status via inquiryStatusMap)
    - personaStatus (raw persona inquiry status)
    - expiry (use inquiry attributes["expires-at"], if present)
  - For unmatched users: set personaStatus mapped from their current KYC status (APPROVED => approved, PENDING => pending, REJECTED => declined)
  - Abort the transaction if anything fails
  - Add logs for visibility and debugging

  Usage:
    pnpm ts-node app/src/scripts/backfill-kyc.ts

  Environment variables:
    - PERSONA_API_KEY must be set
    - DRY_RUN (optional, default "false"): when true, perform all work and logging but rollback the transaction intentionally
*/

import "dotenv/config"

import { prisma } from "@/db/client"

// Local, script-safe Persona types and client to avoid importing server-only code
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

export type PersonaInquiry = {
  id: string
  attributes: {
    status: string
    resolution: string
    "created-at": string
    "updated-at": string
    "started-at": string
    "expires-at": string | null
    "completed-at": string | null
    "failed-at": string | null
    "name-first": string | null
    "name-last": string | null
    "name-middle": string | null
    "email-address": string
    "reference-id": string | null
  }
}

type PersonaResponse<T> = {
  data: T[]
  links: { next?: string }
}

class PersonaClient {
  constructor(private readonly apiKey?: string) {
    if (!apiKey) {
      console.warn("[persona] PERSONA_API_KEY not set; requests will fail")
    }
  }

  async getInquiries(
    nextUrl?: string,
  ): Promise<PersonaResponse<PersonaInquiry>> {
    const url = `${PERSONA_API_URL}${nextUrl || "/api/v1/inquiries"}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    })
    if (!res.ok) {
      throw new Error(
        `[persona] Failed to fetch inquiries: ${res.status} ${res.statusText}`,
      )
    }
    return res.json()
  }
}

const personaClient = new PersonaClient(process.env.PERSONA_API_KEY)

// Helper to compute the date 13 months ago
function dateFutureMonths(months: number) {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d
}

// Normalize emails for matching
function normalizeEmail(email?: string | null) {
  return (email || "").trim().toLowerCase()
}

// Map internal KYCStatus (APPROVED/PENDING/REJECTED) to PersonaStatus (approved/pending/declined)
function mapKYCStatusToPersonaStatus(
  status: string,
): "approved" | "pending" | "declined" {
  switch (status) {
    case "APPROVED":
      return "approved"
    case "REJECTED":
      return "declined"
    case "PENDING":
    default:
      return "pending"
  }
}

async function fetchAllPersonaInquiries(): Promise<PersonaInquiry[]> {
  const results: PersonaInquiry[] = []

  let nextUrl: string | undefined = undefined
  let page = 0

  console.log(`[persona] Fetching ALL inquiries (no early stop) ...`)

  while (true) {
    page += 1
    const response = await personaClient.getInquiries(nextUrl)
    const batch = response?.data || []
    const next = response?.links?.next

    console.log(`[persona] Page ${page}: fetched ${batch.length} inquiries`)

    results.push(...batch)

    // Stop only when there is no next link
    if (!next) {
      break
    }

    nextUrl = next
  }

  console.log(`[persona] Total inquiries fetched: ${results.length}`)
  return results
}

async function main() {
  const DRY_RUN =
    (process.env.DRY_RUN || "false").toLowerCase().trim() === "true"

  const now = new Date()
  const thirteenMonthsinFuture = dateFutureMonths(13)

  // Define an explicit window [start, end] = [now - 13 months, now]
  let windowStart = now
  let windowEnd = thirteenMonthsinFuture

  // Safety guard: if for any reason the bounds are inverted, fix and warn
  if (windowStart > windowEnd) {
    console.warn(
      `[backfill] Detected inverted window; swapping bounds. start=${windowStart.toISOString()} end=${windowEnd.toISOString()}`,
    )
    const tmp = windowStart
    windowStart = windowEnd
    windowEnd = tmp
  }

  console.log(
    `[backfill] Selecting KYC users with expiry between ${windowStart.toISOString()} and ${windowEnd.toISOString()} (now and 13 in the future)`,
  )

  // Only fetch fields we actually need
  const kycUsers = await prisma.kYCUser.findMany({
    where: {
      expiry: {
        gte: windowStart,
        lte: windowEnd,
      },
    },
    select: {
      id: true,
      email: true,
      status: true,
      expiry: true,
      personaStatus: true,
    },
  })

  console.log(`[backfill] Found ${kycUsers.length} KYCUser records to consider`)

  if (kycUsers.length === 0) {
    console.log("[backfill] No KYC users in the target window. Exiting.")
    return
  }

  if (!process.env.PERSONA_API_KEY) {
    console.warn(
      "[backfill] PERSONA_API_KEY is not set. Exiting to avoid empty updates.",
    )
    return
  }

  // Fetch ALL Persona inquiries (we will only update KYC users whose expiry is within the last 13 months)
  const inquiries = await fetchAllPersonaInquiries()

  // Build a map from normalized email -> latest inquiry (by updated-at)
  const latestInquiryByEmail = new Map<string, PersonaInquiry>()
  for (const inq of inquiries) {
    const email = normalizeEmail(inq.attributes?.["email-address"]) || ""
    if (!email) continue

    const prev = latestInquiryByEmail.get(email)
    if (!prev) {
      latestInquiryByEmail.set(email, inq)
      continue
    }

    const prevUpdated = new Date(prev.attributes?.["updated-at"]) || new Date(0)
    const currUpdated = new Date(inq.attributes?.["updated-at"]) || new Date(0)

    if (currUpdated > prevUpdated) {
      latestInquiryByEmail.set(email, inq)
    }
  }

  console.log(
    `[backfill] Unique persona emails indexed: ${latestInquiryByEmail.size}`,
  )

  // Prepare updates
  const matchedUpdates: {
    id: string
    email: string
    oldStatus: string
    newStatus: string
    newPersonaStatus: string
    oldExpiry: Date
    newExpiry: Date | null
  }[] = []

  const unmatchedUpdates: {
    id: string
    email: string
    oldStatus: string
    newPersonaStatus: string
  }[] = []

  for (const user of kycUsers) {
    const email = normalizeEmail(user.email)
    const inquiry = latestInquiryByEmail.get(email)
    if (inquiry) {
      const personaStatusRaw = inquiry.attributes.status // e.g., approved | declined | pending ...
      const mappedKycStatus =
        inquiryStatusMap[personaStatusRaw as keyof typeof inquiryStatusMap]

      if (!mappedKycStatus) {
        console.warn(
          `[match] Unknown Persona inquiry status '${personaStatusRaw}' for ${email}; will skip this user in matched set.`,
        )
        const fallbackPersona = mapKYCStatusToPersonaStatus(user.status)
        // Only set personaStatus if it's currently missing
        if (user.personaStatus == null) {
          unmatchedUpdates.push({
            id: user.id,
            email: user.email,
            oldStatus: user.status,
            newPersonaStatus: fallbackPersona,
          })
        }
        continue
      }

      const expiresAtStr = inquiry.attributes?.["expires-at"]
      const newExpiry = expiresAtStr ? new Date(expiresAtStr) : null

      matchedUpdates.push({
        id: user.id,
        email: user.email,
        oldStatus: user.status,
        newStatus: mappedKycStatus,
        newPersonaStatus: personaStatusRaw,
        oldExpiry: user.expiry,
        newExpiry,
      })
    } else {
      // Unmatched by email
      const fallbackPersona = mapKYCStatusToPersonaStatus(user.status)
      if (user.personaStatus == null) {
        unmatchedUpdates.push({
          id: user.id,
          email: user.email,
          oldStatus: user.status,
          newPersonaStatus: fallbackPersona,
        })
      } else {
        console.log(
          `[skip-unmatched] ${user.email}: personaStatus already set (${user.personaStatus}), skipping fallback update`,
        )
      }
    }
  }

  console.log(
    `[backfill] Prepared updates => matched: ${matchedUpdates.length}, unmatched: ${unmatchedUpdates.length}`,
  )

  // Execute updates one-by-one to avoid long-running transaction issues
  console.log("[update] Starting per-record updates (no transaction)")

  let matchedSuccess = 0
  let matchedFailed = 0
  let unmatchedSuccess = 0
  let unmatchedFailed = 0

  for (const upd of matchedUpdates) {
    const logLine = `[match] ${upd.email}: status ${upd.oldStatus} -> ${
      upd.newStatus
    }; personaStatus -> ${
      upd.newPersonaStatus
    }; expiry ${upd.oldExpiry.toISOString()} -> ${
      upd.newExpiry?.toISOString() || "<null>"
    }`
    if (DRY_RUN) {
      console.log(`[dry-run] ${logLine}`)
      continue
    }

    try {
      await prisma.kYCUser.update({
        where: { id: upd.id },
        data: {
          status: upd.newStatus as any, // Prisma enum KYCStatus
          personaStatus: upd.newPersonaStatus as any, // Prisma enum PersonaStatus
          expiry: upd.newExpiry ?? upd.oldExpiry, // if Persona missing expiry, keep old expiry
          updatedAt: new Date(),
        },
      })
      matchedSuccess += 1
      console.log(`[ok] ${logLine}`)
    } catch (err) {
      matchedFailed += 1
      console.error(
        `[error] Failed matched update for ${upd.email} (${upd.id}):`,
        err,
      )
    }
  }

  for (const upd of unmatchedUpdates) {
    const logLine = `[unmatched] ${upd.email}: personaStatus -> ${upd.newPersonaStatus} (from existing status ${upd.oldStatus})`
    if (DRY_RUN) {
      console.log(`[dry-run] ${logLine}`)
      continue
    }

    try {
      await prisma.kYCUser.update({
        where: { id: upd.id },
        data: {
          personaStatus: upd.newPersonaStatus as any,
          updatedAt: new Date(),
        },
      })
      unmatchedSuccess += 1
      console.log(`[ok] ${logLine}`)
    } catch (err) {
      unmatchedFailed += 1
      console.error(
        `[error] Failed unmatched update for ${upd.email} (${upd.id}):`,
        err,
      )
    }
  }

  console.log(
    `[summary] matched: ok=${matchedSuccess} failed=${matchedFailed}; unmatched: ok=${unmatchedSuccess} failed=${unmatchedFailed}`,
  )

  if (DRY_RUN) {
    console.warn("[dry-run] No changes were committed (DRY_RUN=true)")
  }

  console.log("[backfill] Done")
}

main()
  .then(() => {
    // Do nothing; success path
  })
  .catch((err) => {
    console.error("[backfill] Script failed:", err)
    process.exitCode = 1
  })
  .finally(async () => {
    try {
      await prisma.$disconnect()
      console.log("[backfill] Prisma disconnected")
    } catch (e) {
      console.warn("[backfill] Prisma disconnect encountered an error:", e)
    }
  })
