"use server"

import { auth } from "@/auth"
import { getUserCitizen, upsertCitizen } from "@/db/citizens"

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

  if (!citizen) {
    return {
      error: "Citizen not found",
    }
  }
  return citizen
}
