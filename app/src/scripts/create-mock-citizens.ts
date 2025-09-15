import { User, UserAddress } from "@prisma/client"
import { getAddress } from "viem"

import { prisma } from "@/db/client"
import { CITIZEN_ATTESTATION_CODE, CITIZEN_TYPES } from "@/lib/constants"
import {
  createCitizenAttestation,
  createEntityAttestation,
} from "@/lib/eas/serverOnly"
import { generateTemporaryUsername } from "@/lib/utils/username"

const addressesToCheck = [
  "0x47E7cEe058E7e33dA6Ea2Ba9Ba7A14ae5d7E8cC4",
  "0x49d2a436899A84ce7EaAf9f5AC506776756d4ea4",
  "0x57De675bb963b341479F98E7c5418Bb3B3de2088",
  "0x6D5eFC4cb936c1d5d13dd9b982C467DD3222A39f",
  "0x249DFBBaf7a9cB9CB47a38e399484DBAec642Cad",
  "0x4a6894Dd556fab996f8D50b521f900CAEedC168e",
  "0x2adeDC3D5044cf64ebeE8Fe3d0e564E133bB672A",
  "0x9BB5c1F229235518274A513a48e3D221995e2D5b",
  "0x13ac7d7da4f9063ba7cabc2ad75f90afb3d0877b",
  "0x648BFC4dB7e43e799a84d0f607aF0b4298F932DB",
  "0xA622279f76ddbed4f2CC986c09244262Dba8f4Ba",
  "0xC950b9F32259860f4731D318CB5a28B2dB892f88",
  "0x4F9CCD8C2d017EaDD0CdAaC6692c9BcD96c92e53",
  "0xFdFC6E1BbEc01288447222fC8F1AEE55a7C72b7B",
  "0x155f0A6468f022fE68C25A70fa2DbDbBa2c0B74F",
  "0x5993672EEB4B3e432140D553a0Be330fFCEd1f7D",
  "0x1d671d1B191323A38490972D58354971E5c1cd2A",
  "0xF7f8cD8638119d51F963F08f6015d83D39c87768",
  "0x29cAE049600f9531c020FB21fD7ddFf1B0b9fBFF",
]

type UserWithAddresses = User & {
  addresses: UserAddress[]
}

// Standalone function to get user by address without server actions
async function getUserByAddress(
  address: string,
): Promise<UserWithAddresses | null> {
  const userAddress = await prisma.userAddress.findFirst({
    where: {
      address,
    },
    include: {
      user: {
        include: {
          addresses: {
            orderBy: {
              primary: "desc",
            },
          },
        },
      },
    },
  })

  return userAddress?.user || null
}

// Standalone function to create a new Privy user with wallet address using REST API
async function createPrivyUserWithAddress(
  address: string,
): Promise<UserWithAddresses> {
  const checksumAddress = getAddress(address)

  console.log(`Creating new Privy user for address: ${checksumAddress}`)

  try {
    const appId = process.env.PRIVY_APP_ID
    const appSecret = process.env.PRIVY_APP_SECRET

    if (!appId || !appSecret) {
      throw new Error(
        "PRIVY_APP_ID and PRIVY_APP_SECRET environment variables are required",
      )
    }

    // Create Basic Auth header
    const authHeader = Buffer.from(`${appId}:${appSecret}`).toString("base64")

    // Create a Privy user with the wallet address linked using REST API
    const response = await fetch("https://api.privy.io/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
        "privy-app-id": appId,
      },
      body: JSON.stringify({
        linked_accounts: [
          {
            type: "wallet",
            address: checksumAddress,
            chain_type: "ethereum",
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Failed to create Privy user: ${response.status} ${errorText}`,
      )
    }

    const privyUser = await response.json()
    console.log(`✅ Created Privy user with DID: ${privyUser.id}`)

    // Create the user record in our database
    const user = await prisma.user.create({
      data: {
        privyDid: privyUser.id,
        username: generateTemporaryUsername(privyUser.id),
      },
      include: {
        addresses: {
          orderBy: {
            primary: "desc",
          },
        },
      },
    })

    // Create the user address record
    await prisma.userAddress.create({
      data: {
        userId: user.id,
        address: checksumAddress,
        source: "privy",
        primary: true, // Make this the primary address
      },
    })

    // Fetch the user with addresses to return
    const userWithAddresses = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        addresses: {
          orderBy: {
            primary: "desc",
          },
        },
      },
    })

    if (!userWithAddresses) {
      throw new Error("Failed to create user with addresses")
    }

    return userWithAddresses
  } catch (error) {
    console.error(
      `Failed to create Privy user for address ${checksumAddress}:`,
      error,
    )
    throw error
  }
}

// Function to create a mock organization with proper EAS attestation
async function createMockOrganization(userId: string, index: number) {
  // Create entity attestation first to get a valid UID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { farcasterId: true },
  })

  console.log(`Creating entity attestation for organization ${index}`)
  const organizationId = await createEntityAttestation({
    farcasterId: parseInt(user?.farcasterId || "0"),
    type: "organization",
  })
  console.log(
    `✅ Created entity attestation for organization: ${organizationId}`,
  )

  // Use upsert to handle potential duplicates
  const organization = await prisma.organization.upsert({
    where: { id: organizationId },
    update: {
      name: `Mock Organization ${index}`,
      description: `A mock organization created for testing citizen attestations`,
    },
    create: {
      id: organizationId,
      name: `Mock Organization ${index}`,
      description: `A mock organization created for testing citizen attestations`,
      avatarUrl: null,
      coverUrl: null,
      website: [],
      farcaster: [],
      twitter: null,
      mirror: null,
    },
  })

  // Add the user as admin of the organization (use upsert to handle duplicates)
  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: userId,
        organizationId: organizationId,
      },
    },
    update: {
      role: "admin",
    },
    create: {
      userId: userId,
      organizationId: organizationId,
      role: "admin",
    },
  })

  console.log(
    `✅ Created/updated organization ${organizationId} for user ${userId}`,
  )
  return organization
}

// Function to create a mock project with proper EAS attestation
async function createMockProject(
  userId: string,
  index: number,
  organizationId?: string,
) {
  // Create entity attestation first to get a valid UID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { farcasterId: true },
  })

  console.log(`Creating entity attestation for project ${index}`)
  const projectId = await createEntityAttestation({
    farcasterId: parseInt(user?.farcasterId || "0"),
    type: "project",
  })
  console.log(`✅ Created entity attestation for project: ${projectId}`)

  // Use upsert to handle potential duplicates
  const project = await prisma.project.upsert({
    where: { id: projectId },
    update: {
      name: `Mock Project ${index}`,
      description: `A mock project created for testing citizen attestations`,
    },
    create: {
      id: projectId,
      name: `Mock Project ${index}`,
      description: `A mock project created for testing citizen attestations`,
      category: "DeFi",
      thumbnailUrl: null,
      bannerUrl: null,
      website: [],
      farcaster: [],
      twitter: null,
      mirror: null,
      hasCodeRepositories: true,
      isOnChainContract: true,
      team: {
        create: {
          userId: userId,
          role: "admin",
        },
      },
      ...(organizationId && {
        organization: {
          create: {
            organizationId: organizationId,
          },
        },
      }),
    },
  })

  console.log(`✅ Created/updated project ${projectId} for user ${userId}`)
  return project
}

// Standalone function to upsert citizen without server actions
async function upsertCitizen({
  id,
  citizen,
}: {
  id: string
  citizen: {
    type: string
    address: string
    attestationId?: string
    timeCommitment?: string
    projectId?: string | null
    organizationId?: string | null
  }
}) {
  return prisma.citizen.upsert({
    where: {
      userId: id,
    },
    update: {
      ...citizen,
    },
    create: {
      userId: id,
      ...citizen,
    },
  })
}

async function createMockCitizens() {
  for (let i = 0; i < addressesToCheck.length; i++) {
    const address = addressesToCheck[i]
    try {
      console.log(`\n-------------------------------`)
      console.log(
        `Processing address ${i + 1}/${addressesToCheck.length}: ${address}`,
      )

      // 1. Check if user record exists via UserAddress table
      let user = await getUserByAddress(getAddress(address))

      if (!user) {
        console.log(`No user found for address. Creating new Privy user.`)
        user = await createPrivyUserWithAddress(address)
        console.log(
          `✅ Created new user ${user.id} with Privy DID: ${user.privyDid}`,
        )
      }

      // Use modulo operator to determine citizen type
      const citizenTypeIndex = i % 3 // 0 = user, 1 = organization, 2 = project
      let citizenType: string
      let organizationId: string | null = null
      let projectId: string | null = null

      switch (citizenTypeIndex) {
        case 0:
          citizenType = CITIZEN_TYPES.user
          break
        case 1:
          citizenType = CITIZEN_TYPES.chain
          const organization = await createMockOrganization(user.id, i)
          organizationId = organization.id
          break
        case 2:
          citizenType = CITIZEN_TYPES.app
          const project = await createMockProject(user.id, i)
          projectId = project.id
          break
        default:
          citizenType = CITIZEN_TYPES.user
          break
      }

      // Check if user already has a citizen record for this type
      const existingCitizen = await prisma.citizen.findFirst({
        where: {
          userId: user.id,
          type: citizenType,
          ...(organizationId && { organizationId }),
          ...(projectId && { projectId }),
        },
      })

      if (existingCitizen && existingCitizen.attestationId) {
        console.log(
          `Attestation already exists for user ${user.id} with type ${citizenType}!`,
        )
        continue
      }

      const primaryAddress =
        user.addresses.find((addr: UserAddress) => addr.primary)?.address ||
        address

      console.log(
        `Creating attestation for user ${user.id} with address ${primaryAddress} and type ${citizenType}`,
      )

      const attestationId = await createCitizenAttestation({
        to: primaryAddress,
        farcasterId: parseInt(user.farcasterId || "0"),
        selectionMethod:
          CITIZEN_ATTESTATION_CODE[
            citizenType as keyof typeof CITIZEN_ATTESTATION_CODE
          ],
        refUID: organizationId || projectId || undefined,
      })

      await upsertCitizen({
        id: user.id,
        citizen: {
          address: primaryAddress,
          attestationId,
          type: citizenType,
          projectId: projectId,
          organizationId: organizationId,
        },
      })

      console.log(
        `✅ Successfully created ${citizenType} citizen record for user ${user.id} with attestation: ${attestationId}`,
      )
    } catch (error) {
      console.error(`❌ Error processing address ${address}:`, error)
    }
  }
}

// Run the script
if (require.main === module) {
  createMockCitizens()
    .then(() => {
      console.log("\nScript completed successfully!\n")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Script failed:", error)
      process.exit(1)
    })
}

export { createMockCitizens }
