// A list of addresses and/or emails to create records for
// Either an address or an email must be defined
// Must be an existing User
import { User } from "@prisma/client"

import { prisma } from "@/db/client"
import { getGrantEligibilityExpiration } from "@/db/grantEligibility"
import { GrantType } from "@prisma/client"
import readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"

const USERS = [
  {
    address: "0xDBb050a8692afF8b5EF4A3F36D53900B14210E40",
    email: "garrett@voteagora.com",
    firstName: "Garrett",
    lastName: "Berg",
  },
]

// Determine which step to stop at from CLI arguments (support only: --stop=2, --step=2). Default to 5.
function parseStopAt(argv: string[]): 1 | 2 | 3 | 4 | 5 | undefined {
  for (const a of argv) {
    const eqMatch = a.match(/^--(?:stop|step)=(\d)$/)
    if (eqMatch) {
      const n = Number(eqMatch[1])
      if (n >= 1 && n <= 5) return n as 1 | 2 | 3 | 4 | 5
    }
  }
  return undefined
}
const resolved = parseStopAt(process.argv.slice(2))
const STOP_AT: 1 | 2 | 3 | 4 | 5 = (resolved ?? 5) as 1 | 2 | 3 | 4 | 5
console.log(`Seed KYC script will stop at step: ${STOP_AT} (args: ${process.argv.slice(2).join(" ") || "<none>"})`)

function randomGrantType(): GrantType {
  const options: GrantType[] = [
    "RETRO_FUNDING",
    "AUDIT_GRANT",
    "GROWTH_GRANT",
    "FOUNDATION_MISSION",
  ]
  return options[Math.floor(Math.random() * options.length)]
}

async function ensureGrantEligibility(
  projectId: string,
  suppliedAddress?: string,
  signer?: { email?: string; firstName?: string; lastName?: string },
  stopAt: 1 | 2 | 3 | 4 | 5 = 5,
) {
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

  const baseData: any = { signers: [], entities: [] }
  const consent = { understand: true, privacyConsent: true }

  let form = existing
    ? await prisma.grantEligibility.update({
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
    : await prisma.grantEligibility.create({
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

  // If an address was supplied, proceed to wallet step behaviors
  if (!suppliedAddress) {
    console.warn(
      `No grant delivery address provided for project ${projectId}. The user must complete the Wallet step manually.`,
    )
    return form
  }

  const addressLower = suppliedAddress.toLowerCase()

  // Record required wallet attestations and address
  form = await prisma.grantEligibility.update({
    where: { id: form.id },
    data: {
      walletAddress: addressLower,
      attestations: {
        ...((form.attestations as any) || {}),
        // Step 1 consents already added above
        walletOnMainnet: true,
        walletCanMakeCalls: true,
        walletPledgeDelegate: true,
      },
      expiresAt: getGrantEligibilityExpiration(),
    },
  })

  // Prompt user for wallet verification signature
  console.log(
    "\nPlease verify your wallet signature at: https://optimistic.etherscan.io/verifiedSignatures#",
  )
  const rl = readline.createInterface({ input, output })
  const signature = await rl.question(
    `Paste the wallet verification signature for ${addressLower} (press Enter to skip): `,
  )
  await rl.close()

  if (signature && signature.trim().length > 0) {
    // Store the signature alongside form data for traceability
    const existingData = (form.data as any) || {}
    form = await prisma.grantEligibility.update({
      where: { id: form.id },
      data: {
        data: {
          ...existingData,
          walletVerificationSignature: signature.trim(),
        },
        expiresAt: getGrantEligibilityExpiration(),
      },
    })
  }

  // Emulate verification side-effects: ensure a KYCTeam exists and link it
  let kycTeam = await prisma.kYCTeam.findUnique({
    where: { walletAddress: addressLower },
  })

  if (!kycTeam) {
    kycTeam = await prisma.kYCTeam.create({
      data: { walletAddress: addressLower },
    })
  }

  // Link project and form to this KYC team if not already linked
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { kycTeamId: kycTeam.id },
  })

  if (form.kycTeamId !== kycTeam.id) {
    form = await prisma.grantEligibility.update({
      where: { id: form.id },
      data: { kycTeamId: kycTeam.id },
    })
  }

  // If we should stop after wallet verification, do so now (before signers)
  if (stopAt === 3) {
    form = await prisma.grantEligibility.update({
      where: { id: form.id },
      data: { currentStep: 3, expiresAt: getGrantEligibilityExpiration() },
    })

    console.log(
      `${existing ? "Updated" : "Created"} GrantEligibility form ${form.id} for project ${projectId} at step ${form.currentStep}\n-> http://localhost:3000/grant-eligibility/${form.id}`,
    )
    return form
  }

  // Upsert signer info from provided user details and advance further
  const existingData = (form.data as any) || {}
  const existingSigners = Array.isArray(existingData.signers)
    ? existingData.signers
    : []

  let newSigners = existingSigners
  if (signer && signer.email) {
    const normalizedEmail = signer.email.toLowerCase()
    const idx = existingSigners.findIndex(
      (s: any) => (s.email || "").toLowerCase() === normalizedEmail,
    )
    const signerPayload = {
      firstName: signer.firstName || existingSigners[idx]?.firstName || "",
      lastName: signer.lastName || existingSigners[idx]?.lastName || "",
      email: normalizedEmail,
    }
    if (idx >= 0) {
      newSigners = [...existingSigners]
      newSigners[idx] = { ...existingSigners[idx], ...signerPayload }
    } else {
      newSigners = [...existingSigners, signerPayload]
    }
  }

  const nextStep = stopAt >= 5 ? 5 : 4
  form = await prisma.grantEligibility.update({
    where: { id: form.id },
    data: {
      currentStep: nextStep, // 4: after signers, 5: after entities
      data: {
        ...existingData,
        signers: newSigners,
        // Keep entities as-is; do not auto-fill. If stopAt==5, we still just advance step.
        entities: Array.isArray(existingData.entities)
          ? existingData.entities
          : [],
      },
      expiresAt: getGrantEligibilityExpiration(),
    },
  })

  console.log(
    `Wallet set to ${addressLower}. Linked project ${project.id} and form ${form.id} to KYCTeam ${kycTeam.id}.`,
  )

  console.log(
    `${existing ? "Updated" : "Created"} GrantEligibility form ${
      form.id
    } for project ${projectId} at step ${
      form.currentStep
    }\n-> http://localhost:3000/grant-eligibility/${form.id}`,
  )

  return form
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
      // Branch behavior based on STOP_AT
      if (STOP_AT === 1) {
        // Only create the project; do not start grant-eligibility
        console.log(`Stopping at step 1 for project ${project.id}.`)
      } else if (STOP_AT === 2) {
        // Initialize grant eligibility and stop before wallet verification
        await ensureGrantEligibility(project.id, undefined, undefined, 2)
      } else if (STOP_AT === 3) {
        // Complete wallet/address verification, stop before signers
        await ensureGrantEligibility(project.id, definedUser.address, undefined, 3)
      } else if (STOP_AT === 4) {
        // Fill out signers, stop before entities
        await ensureGrantEligibility(
          project.id,
          definedUser.address,
          {
            email: definedUser.email,
            firstName: (definedUser as any).firstName,
            lastName:
              (definedUser as any).lastName ?? (definedUser as any).LastName,
          },
          4,
        )
      } else {
        // STOP_AT === 5
        // Fill out entities (we advance to step 5; entities data left as-is) and stop before submit
        await ensureGrantEligibility(
          project.id,
          definedUser.address,
          {
            email: definedUser.email,
            firstName: (definedUser as any).firstName,
            lastName:
              (definedUser as any).lastName ?? (definedUser as any).LastName,
          },
          5,
        )
      }
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
