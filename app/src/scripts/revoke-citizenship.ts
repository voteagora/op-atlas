import { PrismaClient } from "@prisma/client"
import { getAddress } from "viem"

import { revokeCitizenAttestation } from "@/lib/eas"

const prisma = new PrismaClient()

async function main() {
  const address = process.env.ADDRESS || process.argv[2]

  if (!address) {
    console.error(
      "Provide address variable like: pnpm revoke:citizenship 0x...",
    )
    process.exit(1)
  }

  try {
    const csAddress = getAddress(address)

    await prisma.s8QualifyingUser.deleteMany({
      where: {
        address: csAddress,
      },
    })

    console.log("Removed from s8QualifyingUser:", csAddress)

    // Find user by address
    const user = await prisma.user.findFirst({
      where: {
        addresses: {
          some: {
            address: csAddress,
          },
        },
      },
    })

    if (!user) {
      console.log("No user found for address:", csAddress)
      return
    }

    // Find citizen record
    const citizen = await prisma.citizen.findFirst({
      where: {
        userId: user.id,
        type: "user",
      },
    })

    if (!citizen || !citizen.attestationId) {
      console.log("No citizen record or attestation found for user:", user.id)
      return
    }

    // Revoke attestation
    await revokeCitizenAttestation(citizen.attestationId)
    console.log("Attestation revoked:", citizen.attestationId)

    // Delete citizen record
    await prisma.citizen.delete({
      where: {
        id: citizen.id,
      },
    })

    console.log("Citizen record deleted:", citizen.id)
    console.log("Citizenship revoked successfully")
  } catch (error) {
    console.error("Error revoking citizenship:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error("Script failed:", e)
  process.exit(1)
})
