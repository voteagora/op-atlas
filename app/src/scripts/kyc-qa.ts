/**
 * New User Script
 *
 * This script combines the functionality of creating KYC users and syncing with Persona.
 * It can create new KYC users and optionally create Persona inquiries for them.
 *
 * Commands:
 * - create <firstName> <lastName> <email> [businessName] [status]: Create a new KYC user
 * - sync: Sync existing Persona inquiries and cases
 * - new-inquiry <KYCUser.id>: Create a new Persona inquiry for an existing KYC user
 *
 * Environment Variables Required:
 * - PERSONA_API_KEY: Required for syncing Persona data and creating inquiries
 * - PERSONA_INQUIRY_KYC_TEMPLATE: Required for creating KYC inquiries
 * - PERSONA_INQUIRY_KYB_TEMPLATE: Required for creating KYB inquiries
 *
 * Usage:
 * - pnpm tsx src/scripts/kyc-qa.ts create <firstName> <lastName> <email> [businessName] [status]
 * - pnpm tsx src/scripts/kyc-qa.ts sync
 * - pnpm tsx src/scripts/kyc-qa.ts new-inquiry <KYCUser.id>
 */

import { PrismaClient } from "@prisma/client"

import { sendKYCStartedEmail } from "@/lib/actions/emails"
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

// Add a function to map case statuses to valid PersonaStatus enum values
function mapCaseStatusToPersonaStatus(caseStatus: string): string {
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
    fields: {
      "form-filler-email-address": {
        type: string
        value: string
      }
      "form-filler-name-first": {
        type: string
        value: string
      }
      "form-filler-name-last": {
        type: string
        value: string
      }
    }
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
    "reference-id": string
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

      const data: { data: PersonaInquiry } = await response.json()
      return data.data
    } catch (error) {
      console.error(`Error fetching inquiry ${inquiryId}:`, error)
      return null
    }
  }
}

const personaClient = new PersonaClient(process.env.PERSONA_API_KEY)

interface CreateKYCUserParams {
  firstName: string
  lastName: string
  email: string
  businessName?: string
  status?: "PENDING" | "APPROVED" | "REJECTED"
}

async function createKYCUser({
  firstName,
  lastName,
  email,
  businessName,
  status = "PENDING",
}: CreateKYCUserParams) {
  try {
    // Check if KYC user already exists with this email
    const existingUser = await prisma.kYCUser.findFirst({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      console.log(`KYC user with email ${email} already exists`)
      console.log("Existing user:", {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        businessName: existingUser.businessName,
        status: existingUser.status,
        email: existingUser.email,
      })
      return existingUser
    }

    // Create new KYC user
    const newUser = await prisma.kYCUser.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        businessName,
        status,
        expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    })

    // Send welcome email to the new user
    try {
      // Re-fetch user with relations for email template
      const newUserWithRelations = await prisma.kYCUser.findUnique({
        where: { id: newUser.id },
        include: {
          KYCUserTeams: true,
          UserKYCUsers: {
            include: {
              user: true
            }
          }
        }
      })

      if (newUserWithRelations) {
        const emailResult = await sendKYCStartedEmail(newUserWithRelations)
        if (!emailResult.success) {
          console.log("⚠️  Welcome email failed to send:", emailResult.error)
        }
      }
    } catch (emailError) {
      console.log(
        "❌ Exception occurred while sending welcome email:",
        emailError,
      )
    }

    console.log("✅ KYC user created successfully:")
    console.log({
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      businessName: newUser.businessName,
      status: newUser.status,
      email: newUser.email,
    })

    return newUser
  } catch (error) {
    console.error("❌ Error creating KYC user:", error)
    throw error
  }
}

async function createPersonaInquiryForUser(kycUser: any) {
  try {
    console.log(`🔗 Creating Persona inquiry for KYC user: ${kycUser.id}`)

    // Determine appropriate template ID based on user type
    const isBusiness = !!kycUser.businessName
    const templateId = isBusiness
      ? process.env.PERSONA_INQUIRY_KYB_TEMPLATE
      : process.env.PERSONA_INQUIRY_KYC_TEMPLATE

    if (!templateId) {
      throw new Error(
        `Missing required template ID for ${isBusiness ? "KYB" : "KYC"} user`,
      )
    }

    console.log("📤 Preparing Persona verification link:")
    console.log(
      `  User Type: ${isBusiness ? "Business (KYB)" : "Individual (KYC)"}`,
    )
    console.log(`  Template ID: ${templateId}`)
    console.log(
      `  Current reference ID: ${kycUser.personaReferenceId || "<none>"}`,
    )
    console.log(`  First Name: ${kycUser.firstName}`)
    console.log(`  Last Name: ${kycUser.lastName}`)
    console.log(`  Email: ${kycUser.email}`)
    if (isBusiness) {
      console.log(`  Business Name: ${kycUser.businessName}`)
    }
    console.log("")

    const result = await createPersonaInquiryLink(kycUser, templateId)

    if (result.success) {
      console.log("✅ Persona verification link generated!")
      if (result.inquiryId) {
        console.log(`📋 Inquiry ID: ${result.inquiryId}`)
      }
      console.log(`🔗 Verification URL: ${result.inquiryUrl}`)
      return result
    } else {
      throw new Error(`Failed to create Persona inquiry: ${result.error}`)
    }
  } catch (error) {
    console.error("❌ Failed to create Persona inquiry:", error)
    throw error
  }
}

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
    WHERE "id" = ${referenceId}
    RETURNING *;
  `

  return result
}

async function updateKYBUserStatus(
  status: string,
  updatedAt: Date,
  personaStatus?: string,
  referenceId?: string,
) {
  const result = await prisma.$queryRaw<any[]>`
    UPDATE "KYCUser" SET
      "status" = ${status}::"KYCStatus",
      "personaStatus" = ${personaStatus}::"PersonaStatus",
      "updatedAt" = ${updatedAt},
      "expiry" = ${updatedAt} + INTERVAL '1 year'
    WHERE "id" = ${referenceId}
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

      if (!referenceId) {
        console.warn(`Missing reference id for inquiry ${inquiry.id}`)
        return
      }

      console.log(
        "Updating inquiry status: ",
        parsedStatus,
        referenceId,
        status,
      )

      await updateKYCUserStatus(
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
        return
      }

      const {
        attributes: { "updated-at": updatedAt, status },
        relationships: {
          inquiries: { data: inquiries },
        },
      } = c

      // Loop through inquiries and load each inquiry using getInquiryById() method
      for (const inquiryRef of inquiries) {
        const inquiryId = inquiryRef.id
        if (!inquiryId) {
          console.warn(`Missing inquiry id in case ${c.id}`)
          continue
        }

        const inquiry: PersonaInquiry | null =
          await personaClient.getInquiryById(inquiryId)

        if (!inquiry) {
          console.warn(`Inquiry not found for id ${inquiryId} in case ${c.id}`)
          continue
        }
        if (inquiry.attributes["reference-id"]) {
          const parsedStatus =
            caseStatusMap[status as keyof typeof caseStatusMap]
          const personaStatus = mapCaseStatusToPersonaStatus(status)

          await updateKYBUserStatus(
            parsedStatus,
            new Date(updatedAt),
            personaStatus,
            inquiry.attributes["reference-id"],
          )
        }
      }
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
      getAndProcessPersonaInquiries(),
      getAndProcessPersonaCases(),
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
      "  pnpm tsx src/scripts/kyc-qa.ts create <firstName> <lastName> <email> [businessName] [status]",
    )
    console.log("  pnpm tsx src/scripts/kyc-qa.ts sync")
    console.log("  pnpm tsx src/scripts/kyc-qa.ts new-inquiry <id>")
    console.log("")
    console.log("Commands:")
    console.log("  create              Create a new KYC user")
    console.log(
      "  sync                Sync existing Persona inquiries and cases",
    )
    console.log(
      "  new-inquiry         Create a new Persona inquiry for existing KYC user",
    )
    console.log("")
    console.log("Examples:")
    console.log(
      "  pnpm tsx src/scripts/kyc-qa.ts create John Doe john@example.com",
    )
    console.log("  pnpm tsx src/scripts/kyc-qa.ts sync")
    console.log("  pnpm tsx src/scripts/kyc-qa.ts new-inquiry <KYCUser.id>")
    process.exit(1)
  }

  const command = args[0]

  if (command === "create") {
    if (args.length < 4) {
      console.log(
        "Usage: pnpm tsx src/scripts/kyc-qa.ts create <firstName> <lastName> <email> [businessName] [status]",
      )
      console.log("")
      console.log("Examples:")
      console.log(
        "  pnpm tsx src/scripts/kyc-qa.ts create John Doe john@example.com",
      )
      console.log(
        "  pnpm tsx src/scripts/kyc-qa.ts create Jane Smith jane@company.com 'Acme Corp'",
      )
      console.log(
        "  pnpm tsx src/scripts/kyc-qa.ts create Bob Wilson bob@test.com 'Test LLC' APPROVED",
      )
      console.log("")
      console.log("Status options: PENDING (default), APPROVED, REJECTED")
      process.exit(1)
    }

    const [firstName, lastName, email, businessName, status] = args.slice(1)

    // Validate status if provided
    if (status && !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      console.error(
        "❌ Invalid status. Must be one of: PENDING, APPROVED, REJECTED",
      )
      process.exit(1)
    }

    try {
      await createKYCUser({
        firstName,
        lastName,
        email,
        businessName: businessName || undefined,
        status: (status as "PENDING" | "APPROVED" | "REJECTED") || "PENDING",
      })
    } catch (error) {
      console.error("❌ Failed to create KYC user:", error)
      process.exit(1)
    } finally {
      await prisma.$disconnect()
    }
    return
  }

  if (command === "new-inquiry") {
    if (args.length !== 2) {
      console.log(
        "Usage: pnpm tsx src/scripts/kyc-qa.ts new-inquiry <KYCUser.id>",
      )
      console.log("")
      console.log(
        "Creates a new Persona inquiry for the specified KYC user and returns the link.",
      )
      process.exit(1)
    }

    const kycUserId = args[1]

    try {
      // Fetch the KYC user from the database
      const kycUser = await prisma.kYCUser.findUnique({
        where: { id: kycUserId },
      })

      if (!kycUser) {
        throw new Error(`KYC user with ID ${kycUserId} not found`)
      }

      await createPersonaInquiryForUser(kycUser)
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
    "  pnpm tsx src/scripts/kyc-qa.ts create <firstName> <lastName> <email> [businessName] [status]",
  )
  console.log("  pnpm tsx src/scripts/kyc-qa.ts sync")
  console.log("  pnpm tsx src/scripts/kyc-qa.ts new-inquiry <id>")
  console.log("")
  console.log("Commands:")
  console.log("  create              Create a new KYC user")
  console.log("  sync                Sync existing Persona inquiries and cases")
  console.log(
    "  new-inquiry         Create a new Persona inquiry for existing KYC user",
  )
  process.exit(1)
}

// Run the script
main()
