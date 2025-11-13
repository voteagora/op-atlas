"use server"

import { revalidatePath } from "next/cache"

import { getUserKYCUser, createUserKYCUser, getUserPersonalKYC, linkOrphanedKYCUserToUser } from "@/db/userKyc"
import { withImpersonation } from "@/lib/db/sessionContext"

import { sendKYCStartedEmail } from "./emails"

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
  return withImpersonation(async ({ db, userId: sessionUserId }) => {
    const targetUserId = userId ?? sessionUserId

    if (!targetUserId) {
      return { hasValidKYC: false, hasApprovedKYC: false }
    }

    const userKycUser = await getUserKYCUser(targetUserId, db)

    return {
      hasValidKYC: !!userKycUser,
      hasApprovedKYC:
        !!userKycUser && userKycUser.kycUser?.status === "APPROVED",
      kycUser: userKycUser?.kycUser || null,
    }
  })
}

export async function createUserKYC(params: CreateUserKYCParams) {
  return withImpersonation(async ({ db, userId }) => {
    if (!userId) {
      return { error: "Unauthorized" }
    }

    const { firstName, lastName, email } = params

    if (!email.trim()) {
      return { error: "Email is required" }
    }

    if ((firstName && !lastName) || (!firstName && lastName)) {
      return {
        error:
          "Both first name and last name are required when providing name information",
      }
    }

    if (firstName && lastName && (!firstName.trim() || !lastName.trim())) {
      return { error: "First name and last name cannot be empty" }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address" }
    }

    try {
      const existingUserKyc = await getUserKYCUser(userId, db)
      if (existingUserKyc) {
        return {
          error:
            "You already have an active KYC verification. Please check your status.",
        }
      }

      const existingKycUser = await db.kYCUser.findFirst({
        where: {
          email: email.toLowerCase(),
          expiry: {
            gt: new Date(),
          },
        },
      })

      let kycUser = existingKycUser
      let isNewUser = false

      if (!kycUser || (kycUser.expiry && kycUser.expiry < new Date())) {
        kycUser = await db.kYCUser.create({
          data: {
            email: email.toLowerCase(),
            firstName: firstName?.trim() || null,
            lastName: lastName?.trim() || null,
            status: "PENDING",
            expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        })
        isNewUser = true
      }

      await createUserKYCUser(userId, kycUser.id, db)

      if (isNewUser) {
        try {
          const kycUserWithRelations = await db.kYCUser.findUnique({
            where: { id: kycUser.id },
            include: {
              KYCUserTeams: true,
              UserKYCUsers: {
                include: {
                  user: true,
                },
              },
            },
          })

          if (kycUserWithRelations) {
            const emailResult = await sendKYCStartedEmail(kycUserWithRelations)
            if (!emailResult.success) {
              console.warn(
                "Failed to send KYC started email:",
                emailResult.error,
              )
            }
          }
        } catch (error) {
          console.warn("Failed to send KYC started email:", error)
        }
      }

      revalidatePath("/dashboard")
      revalidatePath("/profile/details")

      return {
        success: true,
        kycUser,
        isNewUser,
        message: isNewUser
          ? "A message from compliance@optimism.io has been sent to [email@email.com]. Please complete KYC via the link provided and allow 48 hours for your status to update."
          : "KYC verification successfully found for this email!",
      }
    } catch (error) {
      console.error("Error creating user KYC:", error)
      return { error: "Failed to start KYC verification. Please try again." }
    }
  }, { requireUser: true })
}

export async function getPersonalKYCForUser() {
  return withImpersonation(async ({ db, userId }) => {
    if (!userId) {
      return { error: "Unauthorized" }
    }

    try {
      const kycUser = await getUserPersonalKYC(userId, db)
      return { kycUser }
    } catch (error) {
      console.error("Error getting personal KYC:", error)
      return { error: "Failed to get KYC status" }
    }
  }, { requireUser: true })
}

export async function deletePersonalKYC(kycUserId: string) {
  return withImpersonation(async ({ db, userId }) => {
    if (!userId) {
      return { error: "Unauthorized" }
    }

    try {
      const userKycUser = await db.userKYCUser.findFirst({
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

      if (
        kycUser.status === "APPROVED" &&
        kycUser.expiry &&
        kycUser.expiry > new Date()
      ) {
        return {
          error:
            "Cannot delete an active approved verification. Please contact support if you need assistance.",
        }
      }

      await db.$transaction(async (tx) => {
        const kycUserConnections = await tx.userKYCUser.findMany({
          where: {
            kycUserId: kycUser.id,
          },
        })

        const kycUserTeamConnections = await tx.kYCUserTeams.findMany({
          where: {
            kycUserId: kycUser.id,
          },
        })

        if (
          kycUserConnections.length === 1 &&
          kycUserTeamConnections.length === 0
        ) {
          await tx.userKYCUser.delete({
            where: {
              id: userKycUser.id,
            },
          })

          await tx.kYCUser.delete({
            where: {
              id: kycUser.id,
            },
          })
        } else {
          await tx.userKYCUser.delete({
            where: {
              id: userKycUser.id,
            },
          })
        }
      })

      revalidatePath("/dashboard")
      revalidatePath("/profile/details")

      return {
        success: true,
        message:
          "KYC verification deleted successfully. You can now start the process again.",
      }
    } catch (error) {
      console.error("Error deleting personal KYC:", error)
      return { error: "Failed to delete KYC verification. Please try again." }
    }
  }, { requireUser: true })
}

export async function validateOrphanedKYCEmail(email: string) {
  return withImpersonation(async ({ db }) => {
    try {
      const orphanedKYCUser = await db.kYCUser.findFirst({
        where: {
          email: email.toLowerCase(),
          expiry: {
            gt: new Date(),
          },
          UserKYCUsers: {
            none: {},
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
  })
}

export async function linkKYCToUser(verificationToken: string) {
  return withImpersonation(async ({ db }) => {
    try {
      const userEmail = await db.userEmail.findFirst({
        where: {
          verificationToken,
          verificationTokenExpiresAt: {
            gt: new Date(),
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

      const kycUser = await db.kYCUser.findFirst({
        where: {
          email: userEmail.email,
          expiry: {
            gt: new Date(),
          },
          UserKYCUsers: {
            none: {},
          },
        },
      })

      if (!kycUser) {
        return {
          success: false,
          error: "KYC verification no longer available for linking.",
        }
      }

      const existingUserKyc = await getUserKYCUser(userEmail.userId, db)
      if (existingUserKyc) {
        return {
          success: false,
          error: "You already have an active KYC verification.",
        }
      }

      await db.$transaction(async (tx) => {
        await tx.userEmail.update({
          where: { id: userEmail.id },
          data: {
            verified: true,
            verificationToken: null,
            verificationTokenExpiresAt: null,
          },
        })

        await tx.userKYCUser.create({
          data: {
            userId: userEmail.userId,
            kycUserId: kycUser.id,
          },
        })
      })

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
  })
}

export async function checkPendingKYCVerification() {
  return withImpersonation(async ({ db, userId }) => {
    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    try {
      const pendingVerification = await db.userEmail.findFirst({
        where: {
          userId,
          verified: false,
          verificationToken: {
            not: null,
          },
          verificationTokenExpiresAt: {
            gt: new Date(),
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
  }, { requireUser: true })
}

// Attempts to link an existing, orphaned KYCUser by email to the current session user.
// This will NOT create a new KYC record and is safe to call on login.
export async function linkExistingKYCForEmail(email: string) {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return { success: false, error: "Unauthorized" }
      }

      const normalizedEmail = email?.toLowerCase()?.trim()
      if (!normalizedEmail) {
        return { success: false, error: "Email required" }
      }

      try {
        const result = await linkOrphanedKYCUserToUser(
          userId,
          normalizedEmail,
          db,
        )

        if (result.linked) {
          revalidatePath("/dashboard")
          revalidatePath("/profile/details")
          return { success: true, linked: true }
        }

        if (result.reason === "already-linked") {
          return { success: false, alreadyLinked: true }
        }
        if (result.reason === "not-found") {
          return { success: false, notFound: true }
        }
        if (result.reason === "invalid-email") {
          return { success: false, error: "Email invalid" }
        }
        if (result.reason === "no-user") {
          return { success: false, error: "Unauthorized" }
        }

        return { success: false, error: "Failed to link KYC" }
      } catch (error) {
        return { success: false, error: "Failed to link KYC" }
      }
    },
    { requireUser: true },
  )
}
