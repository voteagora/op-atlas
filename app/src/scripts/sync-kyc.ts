/**
 * Sync KYC Data Script
 *
 * This script syncs Persona data following the same pattern as the existing cron job.
 * The script fetches existing Persona inquiries and cases and updates the database.
 *
 * Commands:
 * - sync: Sync existing Persona inquiries and cases (default)
 * - new-inquiry <KYCUser.id>: Create a new Persona inquiry for a KYC user and return the link
 *
 * Environment Variables Required:
 * - PERSONA_API_KEY: Required for syncing Persona data and creating inquiries
 * - PERSONA_TEMPLATE_ID: Required for creating new inquiries
 *
 * Usage:
 * - pnpm tsx src/scripts/sync-kyc.ts sync (syncs data)
 * - pnpm tsx src/scripts/sync-kyc.ts new-inquiry <KYCUser.id> (creates new inquiry)
 */

import { PrismaClient } from "@prisma/client"

import { createPersonaInquiryLink } from "@/lib/actions/persona"

const prisma = new PrismaClient()

const PERSONA_API_URL = "https://app.withpersona.com"

const inquiryStatusMap = {
  approved: "APPROVED",
  expired: "PENDING",
  pending: "PENDING",
  created: "PENDING",
  completed: "PENDING",
  declined: "REJECTED",
  needs_review: "PENDING",
} as const

const caseStatusMap = {
  Approved: "APPROVED",
  Expired: "PENDING",
  Open: "PENDING",
  Created: "PENDING",
  Declined: "REJECTED",
  "Waiting on UBOs": "PENDING",
  "Ready for Review": "PENDING",
} as const

type PersonaInquiry = {
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

type PersonaCase = {
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
  path: "getCases" | "getInquiries",
  nextUrl?: string,
): AsyncGenerator<T[]> {
  let currentUrl = nextUrl

  do {
    const response = (await client[path](currentUrl)) as PersonaResponse<T>

    const batch = response.data
    yield batch
    // Clear references to help garbage collection
    response.data = []
    batch.length = 0

    currentUrl = response.links.next
  } while (currentUrl)
}

async function updateKYCUserStatus(
  name: string,
  email: string,
  status: string,
  updatedAt: Date,
  referenceId?: string,
  personaStatus?: string,
) {
  if (referenceId) {
    const existingUser = await prisma.kYCUser.findUnique({
      where: {
        id: referenceId,
      },
    })

    if (existingUser) {
      console.log("Existing user found for reference id: ", referenceId)
      // Update the existing user record
      const updatedUser = await prisma.kYCUser.update({
        where: { id: referenceId },
        data: {
          status: status as any,
          personaStatus: personaStatus as any,
          updatedAt: updatedAt,
          expiry: new Date(updatedAt.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year from updatedAt
        },
      })
      return updatedUser
    }
  }

  const result = await prisma.$queryRaw<any[]>`
    UPDATE "KYCUser" SET
      "status" = ${status}::"KYCStatus",
      "personaStatus" = ${personaStatus}::"PersonaStatus",
      "updatedAt" = ${updatedAt},
      "expiry" = ${updatedAt} + INTERVAL '1 year'
    WHERE "email" = ${email.toLowerCase()}
    RETURNING *;
  `

  return result
}

async function updateKYBUserStatus(
  name: string,
  email: string,
  status: string,
  updatedAt: Date,
  personaStatus?: string,
) {
  const result = await prisma.$queryRaw<any[]>`
    UPDATE "KYCUser" SET
      "status" = ${status}::"KYCStatus",
      "personaStatus" = ${personaStatus}::"PersonaStatus",
      "updatedAt" = ${updatedAt},
      "expiry" = ${updatedAt} + INTERVAL '1 year'
    WHERE "email" = ${email.toLowerCase()} AND "businessName" IS NOT NULL
    RETURNING *;
  `

  return result
}

async function processPersonaInquiries(inquiries: PersonaInquiry[]) {
  await Promise.all(
    inquiries.map(async (inquiry) => {
      const {
        attributes: {
          "email-address": email,
          "name-first": firstName,
          "name-last": lastName,
          "updated-at": updatedAt,
          "reference-id": referenceId,
          status,
        },
      } = inquiry

      const parsedStatus =
        inquiryStatusMap[status as keyof typeof inquiryStatusMap]

      if (!parsedStatus) {
        console.warn(`Unknown inquiry status: ${status}`)
        return
      }

      if (!email || !referenceId) {
        console.warn(`Missing required fields for inquiry ${inquiry.id}`)
        return
      }

      await updateKYCUserStatus(
        `${firstName} ${lastName}`,
        email,
        parsedStatus,
        new Date(updatedAt),
        referenceId,
        status,
      )
    }),
  )
}

async function processPersonaCases(cases: PersonaCase[]) {
  await Promise.all(
    cases.map(async (c) => {
      if (Object.keys(c.attributes.fields).length === 0) {
        console.warn(`No fields found for case ${c.id}`)
        return
      }

      const {
        attributes: {
          fields: {
            "form-filler-email-address": { value: email },
            "business-name": { value: businessName },
          },
          "updated-at": updatedAt,
          status,
        },
      } = c

      if (!email || !businessName) {
        console.warn(`Missing required fields for case ${c.id}`)
        return
      }

      const parsedStatus = caseStatusMap[status as keyof typeof caseStatusMap]

      if (!parsedStatus) {
        console.warn(`Unknown case status: ${status}`)
        return
      }

      await updateKYBUserStatus(
        businessName,
        email,
        parsedStatus,
        new Date(updatedAt),
        status,
      )
    }),
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

async function getAndProcessPersonaCases() {
  return processPaginatedData(
    () => fetchGenerator<PersonaCase>(personaClient, "getCases"),
    processPersonaCases,
  )
}

async function getAndProcessPersonaInquiries() {
  return processPaginatedData(
    () => fetchGenerator<PersonaInquiry>(personaClient, "getInquiries"),
    processPersonaInquiries,
  )
}

async function syncPersonaData() {
  console.log("🔄 Syncing Persona data...")

  try {
    // Follow the same pattern as the cron job
    await Promise.all([
      getAndProcessPersonaCases(),
      getAndProcessPersonaInquiries(),
    ])

    console.log("✅ Persona data synced successfully")
  } catch (error) {
    console.error("❌ Failed to sync Persona data:", error)
    process.exit(1)
  }
}

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log("Usage:")
    console.log(
      "  pnpm tsx src/scripts/sync-kyc.ts sync               # Sync Persona data",
    )
    console.log(
      "  pnpm tsx src/scripts/sync-kyc.ts new-inquiry <id>   # Create new inquiry",
    )
    console.log("")
    console.log("Commands:")
    console.log("  sync         Sync existing Persona inquiries and cases")
    console.log("  new-inquiry  Create a new Persona inquiry for a KYC user")
    process.exit(1)
  }

  const command = args[0]

  if (command === "new-inquiry") {
    if (args.length !== 2) {
      console.log(
        "Usage: pnpm tsx src/scripts/sync-kyc.ts new-inquiry <KYCUser.id>",
      )
      console.log("")
      console.log(
        "Creates a new Persona inquiry for the specified KYC user and returns the link.",
      )
      process.exit(1)
    }

    const kycUserId = args[1]

    try {
      console.log(`🔗 Creating new Persona inquiry for KYC user: ${kycUserId}`)

      // Fetch the KYC user from the database
      const kycUser = await prisma.kYCUser.findUnique({
        where: { id: kycUserId },
      })

      if (!kycUser) {
        throw new Error(`KYC user with ID ${kycUserId} not found`)
      }

      // Log the payload being sent to Persona
      console.log("📤 Sending payload to Persona API:")
      console.log(`  Template ID: ${process.env.PERSONA_TEMPLATE_ID}`)
      console.log(`  Reference ID: ${kycUser.id}`)
      console.log(`  First Name: ${kycUser.firstName}`)
      console.log(`  Last Name: ${kycUser.lastName}`)
      console.log(`  Email: ${kycUser.email}`)
      console.log("")

      const result = await createPersonaInquiryLink(kycUser)

      if (result.success) {
        console.log("✅ Persona inquiry created successfully!")
        console.log(`📋 Inquiry ID: ${result.inquiryId}`)
        console.log(`🔗 Inquiry URL: ${result.inquiryUrl}`)
      } else {
        console.error("❌ Failed to create Persona inquiry")
        console.error(`Error: ${result.error}`)

        // Log additional debug info
        console.log("")
        console.log("🔍 Debug Information:")
        console.log(`KYC User ID: ${kycUserId}`)
        console.log(`KYC User Email: ${kycUser.email}`)
        console.log(`KYC User Name: ${kycUser.firstName} ${kycUser.lastName}`)
        console.log(
          `PERSONA_TEMPLATE_ID: ${
            process.env.PERSONA_TEMPLATE_ID ? "Set" : "Not Set"
          }`,
        )
        console.log(
          `PERSONA_API_KEY: ${process.env.PERSONA_API_KEY ? "Set" : "Not Set"}`,
        )

        process.exit(1)
      }
    } catch (error) {
      console.error("❌ Failed to create Persona inquiry:", error)
      process.exit(1)
    } finally {
      await prisma.$disconnect()
    }
    return
  }

  if (command === "sync") {
    // Explicit sync command
    try {
      await syncPersonaData()
    } catch (error) {
      console.error("Failed to sync Persona data:", error)
      process.exit(1)
    } finally {
      await prisma.$disconnect()
    }
    return
  }

  // Unknown command
  console.log("Usage:")
  console.log(
    "  pnpm tsx src/scripts/sync-kyc.ts                    # Sync Persona data (default)",
  )
  console.log(
    "  pnpm tsx src/scripts/sync-kyc.ts sync               # Sync Persona data",
  )
  console.log(
    "  pnpm tsx src/scripts/sync-kyc.ts new-inquiry <id>   # Create new inquiry",
  )
  console.log("")
  console.log("Commands:")
  console.log("  sync         Sync existing Persona inquiries and cases")
  console.log("  new-inquiry  Create a new Persona inquiry for a KYC user")
  process.exit(1)
}

// Run the script
main()
