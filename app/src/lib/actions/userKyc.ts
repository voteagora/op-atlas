"use server"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { getUserKYCUser, createUserKYCUser, getUserPersonalKYC } from "@/db/userKyc"
import { sendKYCStartedEmail } from "./emails"
import { revalidatePath } from "next/cache"

export interface CreateUserKYCParams {
  firstName: string
  lastName: string
  email: string
  businessName?: string
}

export interface UserKYCStatus {
  hasValidKYC: boolean
  kycUser?: any
}

export async function getUserKYCStatus(userId?: string): Promise<UserKYCStatus> {
  if (!userId) {
    const session = await auth()
    userId = session?.user?.id

    if (!userId) {
      return { hasValidKYC: false }
    }
  }

  const userKycUser = await getUserKYCUser(userId)

  return {
    hasValidKYC: !!userKycUser,
    kycUser: userKycUser?.kycUser || null,
  }
}

export async function createUserKYC(params: CreateUserKYCParams) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Unauthorized" }
  }

  const { firstName, lastName, email, businessName } = params

  // Validate required fields
  if (!firstName.trim() || !lastName.trim() || !email.trim()) {
    return { error: "First name, last name, and email are required" }
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address" }
  }

  try {
    // Check if user already has a valid KYC
    const existingUserKyc = await getUserKYCUser(userId)
    if (existingUserKyc) {
      return { error: "You already have an active KYC verification. Please check your status." }
    }

    // Check if email is already used for an active KYC
    const existingKycUser = await prisma.kYCUser.findFirst({
      where: {
        email: email.toLowerCase(),
        expiry: {
          gt: new Date(),
        },
      },
    })

    let kycUser = existingKycUser
    let isNewUser = false

    // If user doesn't exist or is expired, create/recreate them
    if (!kycUser || (kycUser.expiry && kycUser.expiry < new Date())) {
      kycUser = await prisma.kYCUser.create({
        data: {
          email: email.toLowerCase(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          businessName: businessName?.trim() || null,
          kycUserType: businessName?.trim() ? "LEGAL_ENTITY" : "USER",
          status: "PENDING",
          expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
      })
      isNewUser = true
    }

    // Create UserKYCUser relationship
    await createUserKYCUser(userId, kycUser.id)

    // Send KYC started email if this is a new user
    if (isNewUser) {
      try {
        const emailResult = await sendKYCStartedEmail(kycUser)
        if (!emailResult.success) {
          console.warn("Failed to send KYC started email:", emailResult.error)
        }
      } catch (error) {
        console.warn("Failed to send KYC started email:", error)
      }
    }

    // Revalidate dashboard and profile pages
    revalidatePath("/dashboard")
    revalidatePath("/profile/kyc")

    return {
      success: true,
      kycUser,
      message: isNewUser
        ? "KYC verification started successfully! Check your email for next steps."
        : "KYC verification resumed successfully!"
    }

  } catch (error) {
    console.error("Error creating user KYC:", error)
    return { error: "Failed to start KYC verification. Please try again." }
  }
}

export async function getPersonalKYCForUser() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Unauthorized" }
  }

  try {
    const kycUser = await getUserPersonalKYC(userId)
    return { kycUser }
  } catch (error) {
    console.error("Error getting personal KYC:", error)
    return { error: "Failed to get KYC status" }
  }
}

export async function deletePersonalKYC(kycUserId: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Unauthorized" }
  }

  try {
    // Verify that this KYCUser belongs to the authenticated user
    const userKycUser = await prisma.userKYCUser.findFirst({
      where: {
        userId,
        kycUserId,
      },
      include: {
        kycUser: true,
      },
    })

    if (!userKycUser) {
      return { error: "KYC verification not found or unauthorized" }
    }

    const kycUser = userKycUser.kycUser

    // Security check: Don't allow deletion of approved KYC unless expired
    if (kycUser.status === "APPROVED" && kycUser.expiry && kycUser.expiry > new Date()) {
      return {
        error: "Cannot delete an active approved verification. Please contact support if you need assistance."
      }
    }

    await prisma.$transaction(async (tx) => {
      // Check if this KYCUser is only associated with this user
      const kycUserConnections = await tx.userKYCUser.findMany({
        where: {
          kycUserId: kycUser.id,
        },
      })

      // Also check for KYCUserTeams connections (project/org KYC)
      const kycUserTeamConnections = await tx.kYCUserTeams.findMany({
        where: {
          kycUserId: kycUser.id,
        },
      })

      // If this KYCUser is only connected to this user and no teams, we can safely delete it
      if (kycUserConnections.length === 1 && kycUserTeamConnections.length === 0) {
        // Delete the UserKYCUser relationship first
        await tx.userKYCUser.delete({
          where: {
            id: userKycUser.id,
          },
        })

        // Delete the KYCUser itself
        await tx.kYCUser.delete({
          where: {
            id: kycUser.id,
          },
        })
      } else {
        // If the KYCUser is shared with other entities, just remove this user's connection
        await tx.userKYCUser.delete({
          where: {
            id: userKycUser.id,
          },
        })
      }
    })

    // Revalidate pages
    revalidatePath("/dashboard")
    revalidatePath("/profile/kyc")

    return {
      success: true,
      message: "KYC verification deleted successfully. You can now start the process again."
    }

  } catch (error) {
    console.error("Error deleting personal KYC:", error)
    return { error: "Failed to delete KYC verification. Please try again." }
  }
}