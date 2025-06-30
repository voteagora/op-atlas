import { PrismaClient } from "@prisma/client"
import { getAddress } from "viem"

import { CITIZEN_TYPES } from "@/lib/constants"

const prisma = new PrismaClient()

// Configuration of addresses for testing
const TEST_ADDRESSES = [
  "0x6d02cF24ea9773F3F0f01b73A3794835D1e14608",
  "0x084D347EC384Fbf820a81F14E78C20EA37B5cB47",
]

async function createPrivyUser(address: string) {
  try {
    console.log(`Creating new Privy user for address: ${address}`)

    // Create basic user in database
    const privyDid = `did:privy:mock-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`

    const user = await prisma.user.create({
      data: {
        privyDid,
        username: null,
        imageUrl: null,
        farcasterId: null,
        addresses: {
          create: [
            {
              address: address,
              primary: true,
              source: "mock",
            },
          ],
        },
        emails: {
          create: [
            {
              email: `mock-${Date.now()}@example.com`,
              verified: true,
            },
          ],
        },
      },
      include: {
        addresses: true,
        emails: true,
        citizen: true,
      },
    })

    console.log(`✅ Created Privy user with DID: ${privyDid}`)
    return user
  } catch (error) {
    console.error(`❌ Error creating Privy user:`, error)
    throw error
  }
}

async function processAddress(address: string, index: number) {
  try {
    const checksumAddress = getAddress(address)
    console.log(`\n-------------------------------`)
    console.log(
      `Processing address ${index + 1}/${
        TEST_ADDRESSES.length
      }: ${checksumAddress}`,
    )

    // Check if user already exists with this address
    let user = await prisma.user.findFirst({
      where: {
        addresses: {
          some: {
            address: checksumAddress,
          },
        },
      },
      include: {
        addresses: true,
        emails: true,
        citizen: true,
      },
    })

    // If user already has a citizen record, skip
    if (user?.citizen) {
      console.log(
        `Citizen record already exists for user ${user.id} with type ${user.citizen.type}!`,
      )
      return
    }

    // If user doesn't exist, create one
    if (!user) {
      console.log("No user found for address. Creating new Privy user.")
      user = await createPrivyUser(checksumAddress)
    } else {
      console.log(`✅ Found existing user ${user.id}`)
    }

    if (!user) {
      throw new Error("Failed to create or find user")
    }

    // Determine what type of citizen to create based on index
    let citizenType: string
    let projectId: string | null = null
    let organizationId: string | null = null

    if (index === 0) {
      // First user: Chain citizen (organization)
      citizenType = CITIZEN_TYPES.chain
      organizationId = "mock-org-id"
      console.log(`✅ Assigning organization for user ${user.id}`)
    } else {
      // Other users: App citizen (project)
      citizenType = CITIZEN_TYPES.app
      projectId = "mock-project-id"
      console.log(`✅ Assigning project for user ${user.id}`)
    }

    // Create mock attestation ID for local testing
    const mockAttestationId = `0x${Math.random()
      .toString(16)
      .slice(2)
      .padStart(64, "0")}`

    console.log(
      `Creating local citizen record for user ${user.id} with address ${checksumAddress} and type ${citizenType}`,
    )

    // Create citizen record (without blockchain attestation for testing)
    await prisma.citizen.upsert({
      where: {
        userId: user.id,
      },
      update: {
        address: checksumAddress,
        attestationId: mockAttestationId,
        type: citizenType,
        projectId,
        organizationId,
      },
      create: {
        userId: user.id,
        address: checksumAddress,
        attestationId: mockAttestationId,
        type: citizenType,
        projectId,
        organizationId,
      },
    })

    console.log(
      `✅ Successfully created ${citizenType} citizen record for user ${user.id} with mock attestation: ${mockAttestationId}`,
    )
  } catch (error) {
    console.error(`❌ Error processing address ${address}:`, error)
    throw error
  }
}

async function main() {
  try {
    console.log("🚀 Starting SIMPLE mock citizens creation script...")
    console.log(
      "📝 NOTE: This creates local database records only (no blockchain attestations)",
    )
    console.log(`Will process ${TEST_ADDRESSES.length} addresses`)

    for (let i = 0; i < TEST_ADDRESSES.length; i++) {
      await processAddress(TEST_ADDRESSES[i], i)
    }

    console.log("\n✅ Script completed successfully!")
    console.log("🎯 You can now test Safe wallet voting functionality!")
    console.log(
      "📍 Connect with Safe wallet address: 0x084D347EC384Fbf820a81F14E78C20EA37B5cB47",
    )
    console.log(
      "📍 Connect with MetaMask address: 0x6d02cF24ea9773F3F0f01b73A3794835D1e14608",
    )
  } catch (error) {
    console.error("❌ Script failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Execute only if called directly
if (require.main === module) {
  main()
}

export { main as createSimpleMockCitizens }
