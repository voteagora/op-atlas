/**
 * Sync KYC Data Script
 * 
 * This script syncs Persona data following the same pattern as the existing cron job.
 * The script fetches existing Persona inquiries and cases and updates the database.
 * 
 * Note: This script does NOT create new Persona entities or KYC records. 
 * Persona inquiries and cases must be created externally (via Persona's web interface or API).
 * KYC records are created through other processes in the application.
 * 
 * Environment Variables Required:
 * - PERSONA_API_KEY: Required for syncing Persona data
 * 
 * Usage:
 * - pnpm tsx src/scripts/sync-kyc.ts
 */

import { PrismaClient } from "@prisma/client"

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
        const response = (await client[path](
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

async function updateKYCUserStatus(
    name: string,
    email: string,
    status: string,
    updatedAt: Date,
) {
    const result = await prisma.$queryRaw<any[]>`
    WITH closest_match AS (
      SELECT id, difference(lower(unaccent("firstName") || ' ' || unaccent("lastName")), lower(unaccent(${name}))) as name_similarity
      FROM "KYCUser" 
      WHERE "email" = ${email.toLowerCase()}
      ORDER BY name_similarity DESC
      LIMIT 1
    )
    UPDATE "KYCUser" SET
      "status" = ${status}::"KYCStatus",
      "updatedAt" = ${updatedAt},
      "expiry" = ${updatedAt} + INTERVAL '1 year'
    WHERE EXISTS (
      SELECT 1 FROM closest_match 
      WHERE closest_match.id = "KYCUser".id
      AND closest_match.name_similarity > 2
    )
    RETURNING *;
  `

    return result
}

async function updateKYBUserStatus(
    name: string,
    email: string,
    status: string,
    updatedAt: Date,
) {
    const result = await prisma.$queryRaw<any[]>`
    WITH closest_match AS (
      SELECT id, difference(lower(unaccent("businessName")), lower(unaccent(${name}))) as name_similarity
      FROM "KYCUser" 
      WHERE "email" = ${email.toLowerCase()} AND "businessName" IS NOT NULL
      ORDER BY name_similarity DESC
      LIMIT 1
    )
    UPDATE "KYCUser" SET
      "status" = ${status}::"KYCStatus",
      "updatedAt" = ${updatedAt},
      "expiry" = ${updatedAt} + INTERVAL '1 year'
    WHERE EXISTS (
      SELECT 1 FROM closest_match 
      WHERE closest_match.id = "KYCUser".id
      AND closest_match.name_similarity > 2
    )
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
                    status,
                },
            } = inquiry

            const parsedStatus =
                inquiryStatusMap[status as keyof typeof inquiryStatusMap]

            if (!parsedStatus) {
                console.warn(`Unknown inquiry status: ${status}`)
                return
            }

            if (!email || !firstName || !lastName) {
                console.warn(`Missing required fields for inquiry ${inquiry.id}`)
                return
            }

            await updateKYCUserStatus(
                `${firstName.split(" ")[0]} ${lastName}`,
                email,
                parsedStatus,
                new Date(updatedAt),
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

    if (args.length > 0) {
        console.log("Usage: pnpm tsx src/scripts/sync-kyc.ts")
        console.log("")
        console.log("This script syncs existing Persona inquiries and cases to update the database.")
        console.log("No arguments are needed.")
        process.exit(1)
    }

    try {
        await syncPersonaData()
    } catch (error) {
        console.error("Failed to sync Persona data:", error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

// Run the script
main()
