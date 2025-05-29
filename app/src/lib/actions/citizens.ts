"use server"

import { auth } from "@/auth"
import { getUserCitizen, upsertCitizen } from "@/db/citizens"
import { getUserById } from "@/db/users"
import { createCitizenAttestation } from "@/lib/eas"

export const updateCitizen = async (citizen: {
  address?: string
  attestationId?: string
  timeCommitment?: string
}) => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  try {
    const result = await upsertCitizen({
      id: userId,
      citizen,
    })

    return result
  } catch (error) {
    console.error("Error updating citizen:", error)
    return {
      error: "Failed to update citizen",
    }
  }
}

export const getCitizenByUserId = async (userId: string) => {
  const citizen = await getUserCitizen(userId)
  return citizen
}

export const attestCitizen = async () => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return {
      error: "Unauthorized",
    }
  }

  try {
    // Get user with addresses
    const user = await getUserById(userId)
    if (!user) {
      return {
        error: "User not found",
      }
    }

    // Get primary address
    const primaryAddress = user.addresses.find(addr => addr.primary)?.address
    if (!primaryAddress) {
      return {
        error: "No primary address set",
      }
    }

    // Create attestation
    const attestationId = await createCitizenAttestation({
      farcasterId: user.farcasterId ? parseInt(user.farcasterId) : 0,
    })

    // Update citizen record
    const result = await upsertCitizen({
      id: userId,
      citizen: {
        address: primaryAddress,
        attestationId,
      },
    })

    return result
  } catch (error) {
    console.error("Error attesting citizen:", error)
    return {
      error: "Failed to attest citizen",
    }
  }
}
