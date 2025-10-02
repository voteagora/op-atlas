"use server"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { getUserKYCUser, createUserKYCUser, getUserPersonalKYC } from "@/db/userKyc"
import { sendKYCStartedEmail } from "./emails"
import { revalidatePath } from "next/cache"

export interface CreateUserKYCParams {
  firstName?: string
  lastName?: string
  email: string
}

export interface UserKYCStatus {
  hasValidKYC: boolean
  hasApprovedKYC: boolean
  kycUser?: any
}

export async function getUserKYCStatus(userId?: string): Promise<UserKYCStatus> {
  if (!userId) {
    const session = await auth()
    userId = session?.user?.id

    if (!userId) {
      return { hasValidKYC: false, hasApprovedKYC: false }
    }
  }

  const userKycUser = await getUserKYCUser(userId)

  return {
    hasValidKYC: !!userKycUser,
    hasApprovedKYC: !!userKycUser && userKycUser.kycUser?.status === 'APPROVED',
    kycUser: userKycUser?.kycUser || null,
  }
}

export async function createUserKYC(params: CreateUserKYCParams) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Unauthorized" }
  }

  const { firstName, lastName, email } = params

  // Email is always required
  if (!email.trim()) {
    return { error: "Email is required" }
  }

  // If firstName or lastName are provided, both must be provided
  if ((firstName && !lastName) || (!firstName && lastName)) {
    return { error: "Both first name and last name are required when providing name information" }
  }

  // If firstName and lastName are provided, validate them
  if (firstName && lastName && (!firstName.trim() || !lastName.trim())) {
    return { error: "First name and last name cannot be empty" }
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
          firstName: firstName?.trim() || null,
          lastName: lastName?.trim() || null,
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
        // Re-fetch kycUser with relations for email template
        const kycUserWithRelations = await prisma.kYCUser.findUnique({
          where: { id: kycUser.id },
          include: {
            KYCUserTeams: true,
            UserKYCUsers: {
              include: {
                user: true
              }
            }
          }
        })

        if (kycUserWithRelations) {
          const emailResult = await sendKYCStartedEmail(kycUserWithRelations)
          if (!emailResult.success) {
            console.warn("Failed to send KYC started email:", emailResult.error)
          }
        }
      } catch (error) {
        console.warn("Failed to send KYC started email:", error)
      }
    }

    // Revalidate dashboard and profile pages
    revalidatePath("/dashboard")
    revalidatePath("/profile/details")

    return {
      success: true,
      kycUser,
      isNewUser,
      message: isNewUser
        ? "A message from compliance@optimism.io has been sent to [email@email.com]. Please complete KYC via the link provided and allow 48 hours for your status to update."
        : "KYC verification successfully found for this email!"
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
    revalidatePath("/profile/details")

    return {
      success: true,
      message: "KYC verification deleted successfully. You can now start the process again."
    }

  } catch (error) {
    console.error("Error deleting personal KYC:", error)
    return { error: "Failed to delete KYC verification. Please try again." }
  }
}

export async function validateOrphanedKYCEmail(email: string) {
  try {
    // Check if email belongs to an orphaned, non-expired KYCUser
    const orphanedKYCUser = await prisma.kYCUser.findFirst({
      where: {
        email: email.toLowerCase(),
        expiry: {
          gt: new Date(), // Not expired
        },
        UserKYCUsers: {
          none: {}, // No existing user associations (orphaned)
        },
      },
    })

    if (!orphanedKYCUser) {
      return {
        success: false,
        error: "No KYC verification found for this email address.",
      }
    }

    return {
      success: true,
      kycUser: orphanedKYCUser,
    }
  } catch (error) {
    console.error("Error validating orphaned KYC email:", error)
    return {
      success: false,
      error: "Failed to validate email. Please try again.",
    }
  }
}


export async function linkKYCToUser(verificationToken: string) {
  try {
    // Find UserEmail with valid token
    const userEmail = await prisma.userEmail.findFirst({
      where: {
        verificationToken,
        verificationTokenExpiresAt: {
          gt: new Date(), // Token not expired
        },
        verified: false,
      },
      include: {
        user: true,
      },
    })

    if (!userEmail) {
      return {
        success: false,
        error: "Invalid or expired verification link.",
      }
    }

    // Find the KYCUser for this email
    const kycUser = await prisma.kYCUser.findFirst({
      where: {
        email: userEmail.email,
        expiry: {
          gt: new Date(), // Not expired
        },
        UserKYCUsers: {
          none: {}, // Still orphaned
        },
      },
    })

    if (!kycUser) {
      return {
        success: false,
        error: "KYC verification no longer available for linking.",
      }
    }

    // Check if user already has a KYC
    const existingUserKyc = await getUserKYCUser(userEmail.userId)
    if (existingUserKyc) {
      return {
        success: false,
        error: "You already have an active KYC verification.",
      }
    }

    // Link KYC to user in a transaction
    await prisma.$transaction(async (tx) => {
      // Mark email as verified and clear token
      await tx.userEmail.update({
        where: { id: userEmail.id },
        data: {
          verified: true,
          verificationToken: null,
          verificationTokenExpiresAt: null,
        },
      })

      // Create UserKYCUser relationship
      await tx.userKYCUser.create({
        data: {
          userId: userEmail.userId,
          kycUserId: kycUser.id,
        },
      })
    })

    // Revalidate pages
    revalidatePath("/dashboard")
    revalidatePath("/profile/details")

    return {
      success: true,
      message: "KYC verification successfully linked to your account!",
    }
  } catch (error) {
    console.error("Error linking KYC to user:", error)
    return {
      success: false,
      error: "Failed to link KYC verification. Please try again.",
    }
  }
}

export async function checkPendingKYCVerification() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Check if user has a pending verification email
    const pendingVerification = await prisma.userEmail.findFirst({
      where: {
        userId,
        verified: false,
        verificationToken: {
          not: null,
        },
        verificationTokenExpiresAt: {
          gt: new Date(), // Token not expired
        },
      },
    })

    return {
      success: true,
      hasPendingVerification: !!pendingVerification,
      email: pendingVerification?.email || null,
    }
  } catch (error) {
    console.error("Error checking pending KYC verification:", error)
    return {
      success: false,
      error: "Failed to check verification status.",
    }
  }
}