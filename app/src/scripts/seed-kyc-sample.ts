// A list of addresses and/or emails to create records for
// Either an address or an email must be defined
// Must be an existing User
import { User } from "@prisma/client"

import { prisma } from "@/db/client"
import { getGrantEligibilityExpiration } from "@/db/grantEligibility"
import { GrantType } from "@prisma/client"

const USERS = [
  {
    address: "0xDBb050a8692afF8b5EF4A3F36D53900B14210E40",
    email: "gberg@voteagora.com",
  },
]

function randomGrantType(): GrantType {
  const options: GrantType[] = [
    "RETRO_FUNDING",
    "AUDIT_GRANT",
    "GROWTH_GRANT",
    "FOUNDATION_MISSION",
  ]
  return options[Math.floor(Math.random() * options.length)]
}

async function ensureGrantEligibility(projectId: string) {
  // Find latest active draft
  const existing = await prisma.grantEligibility.findFirst({
    where: {
      projectId,
      deletedAt: null,
      submittedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })

  const baseData = { signers: [], entities: [] }
  const consent = { understand: true, privacyConsent: true }

  if (existing) {
    const updated = await prisma.grantEligibility.update({
      where: { id: existing.id },
      data: {
        currentStep: existing.currentStep < 2 ? 2 : existing.currentStep,
        grantType: existing.grantType ?? randomGrantType(),
        attestations: {
          ...((existing.attestations as any) || {}),
          ...consent,
        },
        // preserve any existing data, ensure structure exists
        data:
          (existing.data as any) && typeof existing.data === "object"
            ? { ...((existing.data as any) || {}), ...baseData }
            : baseData,
        expiresAt: getGrantEligibilityExpiration(),
      },
    })
    console.log(
      `Updated GrantEligibility form ${updated.id} for project ${projectId} to step ${updated.currentStep}`,
    )
    return updated
  }

  const created = await prisma.grantEligibility.create({
    data: {
      currentStep: 2,
      projectId,
      grantType: randomGrantType(),
      walletAddress: null,
      attestations: consent,
      data: baseData,
      expiresAt: getGrantEligibilityExpiration(),
    },
  })
  console.log(
    `Created GrantEligibility form ${created.id} for project ${projectId} at step 2\n-> http://localhost:3000/grant-eligibility/${created.id}`,
  )
  return created
}

async function createProject(userId: string) {
  const name = `Project ${Math.floor(100000 + Math.random() * 900000)}`

  try {
    const project = await prisma.project.create({
      data: {
        name,
        category: [
          "CeFi",
          "DeFi",
          "Infrastructure",
          "NFT",
          "Social",
          "Gaming",
          "Privacy",
          "ReFi",
        ][Math.floor(Math.random() * 8)],
        website: [],
        farcaster: [],
        team: {
          create: {
            role: "admin",
            user: { connect: { id: userId } },
          },
        },
      },
    })
    console.log(`Created project for user ${userId}: ${project.id}`)
    return project
  } catch (e) {
    console.error(`Error creating project for user ${userId}:`, e)
  }
}

async function main() {
  for (const definedUser of USERS) {
    let user: User | null
    // Build a where clause based on the provided identifiers (address/email)
    const where: any = { OR: [] as any[] }
    if (definedUser.address) {
      where.OR.push({
        addresses: {
          some: {
            address: { equals: definedUser.address, mode: "insensitive" },
          },
        },
      })
    }
    if (definedUser.email) {
      where.OR.push({
        emails: {
          some: {
            email: { equals: definedUser.email, mode: "insensitive" },
          },
        },
      })
    }

    if (!where.OR.length) {
      console.warn("No address or email provided. Skipping...")
      continue
    }

    user = await prisma.user.findFirst({
      where,
    })

    if (!user) {
      console.warn(
        `User not found for address: ${definedUser.address} Or email: ${definedUser.email}. Skipping...`,
      )
      continue
    }

    // Create a minimal project using ProjectDetailsForm defaults where applicable
    const project = await createProject(user.id)
    if (project?.id) {
      await ensureGrantEligibility(project.id)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
