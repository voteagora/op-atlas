"use server"

import { KYCLegalEntity, KYCUser } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { getFindMyKYCVerificationTemplate } from "@/lib/emailTemplates"
import {
  EmailResponse,
  KycReminderUser,
  LegalEntityWithController,
  sendKYBReminderEmailInternal,
  sendKYCReminderEmailInternal,
  sendTransactionEmail,
} from "@/lib/email/send"
import { withImpersonation } from "@/lib/db/sessionContext"

import { getUserOrganizationRole, getUserProjectRole } from "./utils"

async function requireAdminReminderAccess(
  userId: string | null,
  projectId: string | undefined,
  organizationId: string | undefined,
  db: Parameters<typeof getUserProjectRole>[2],
): Promise<EmailResponse | null> {
  if (!userId) {
    return {
      success: false,
      error: "Unauthorized",
    }
  }

  if (projectId) {
    const userRole = await getUserProjectRole(projectId, userId, db)
    if (userRole !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Project admin access required",
      }
    }
    return null
  }

  if (organizationId) {
    const userRole = await getUserOrganizationRole(organizationId, userId, db)
    if (userRole !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Organization admin access required",
      }
    }
    return null
  }

  return {
    success: false,
    error: "Missing context - projectId or organizationId required",
  }
}

export const sendKYCReminderEmail = async (
  kycUser: KycReminderUser,
  context: {
    projectId?: string
    organizationId?: string
  },
): Promise<EmailResponse> =>
  withImpersonation(
    async ({ db, userId }) => {
      const authorizationError = await requireAdminReminderAccess(
        userId,
        context.projectId,
        context.organizationId,
        db,
      )

      if (authorizationError) {
        return authorizationError
      }

      return sendKYCReminderEmailInternal(kycUser, db)
    },
    { requireUser: true },
  )

export const sendKYBReminderEmail = async (
  legalEntityInput: LegalEntityWithController | { id: string },
  context: {
    projectId?: string
    organizationId?: string
  } = {},
): Promise<EmailResponse> =>
  withImpersonation(
    async ({ db, userId }) => {
      const authorizationError = await requireAdminReminderAccess(
        userId,
        context.projectId,
        context.organizationId,
        db,
      )

      if (authorizationError) {
        return authorizationError
      }

      return sendKYBReminderEmailInternal(legalEntityInput, db)
    },
    { requireUser: true },
  )

export const sendPersonalKYCReminderEmail = async (
  kycUserId: string,
): Promise<EmailResponse> => {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          success: false,
          error: "Unauthorized",
        }
      }

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
        return {
          success: false,
          error: "KYC verification not found or unauthorized",
        }
      }

      if (userKycUser.kycUser.status === "APPROVED") {
        return {
          success: false,
          error: "Cannot resend email for already approved verification",
        }
      }

      return sendKYCReminderEmailInternal(userKycUser.kycUser, db)
    },
    { requireUser: true },
  )
}

export async function sendFindMyKYCVerificationCode(
  email: string,
): Promise<EmailResponse> {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return { success: false, error: "Unauthorized" }
      }

      try {
        const existingUserKyc = await db.userKYCUser.findFirst({
          where: {
            userId,
            kycUser: {
              expiry: {
                gt: new Date(),
              },
            },
          },
          include: {
            kycUser: true,
          },
        })

        if (existingUserKyc) {
          return {
            success: false,
            error: "You already have an active KYC verification.",
          }
        }

        const existingVerifiedEmail = await db.userEmail.findFirst({
          where: {
            userId,
            email: email.toLowerCase(),
            verified: true,
          },
        })

        if (existingVerifiedEmail) {
          return {
            success: false,
            error: "This email is already verified on your account.",
          }
        }

        const emailUsedByOtherUser = await db.userEmail.findFirst({
          where: {
            email: email.toLowerCase(),
            userId: {
              not: userId,
            },
          },
        })

        if (emailUsedByOtherUser) {
          return {
            success: false,
            error:
              "Unable to process this email address. Please try a different email or contact support if you believe this is an error.",
          }
        }

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

        await db.userEmail.deleteMany({
          where: {
            userId,
            verified: false,
          },
        })

        let userEmail = await db.userEmail.findFirst({
          where: {
            userId,
            email: email.toLowerCase(),
          },
        })

        const verificationCode = Math.floor(
          100000 + Math.random() * 900000,
        ).toString()
        const verificationTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

        if (userEmail) {
          userEmail = await db.userEmail.update({
            where: { id: userEmail.id },
            data: {
              verified: false,
              verificationToken: verificationCode,
              verificationTokenExpiresAt,
            },
          })
        } else {
          try {
            userEmail = await db.userEmail.create({
              data: {
                userId,
                email: email.toLowerCase(),
                verified: false,
                verificationToken: verificationCode,
                verificationTokenExpiresAt,
              },
            })
          } catch (createError) {
            if (
              createError instanceof Error &&
              (createError.message.includes("Unique constraint") ||
                createError.message.includes("unique"))
            ) {
              return {
                success: false,
                error:
                  "Unable to process this email address. Please try a different email or contact support if you believe this is an error.",
              }
            }
            throw createError
          }
        }

        const emailResult = await sendTransactionEmail({
          to: email.toLowerCase(),
          subject: "Verify your email to link your KYC verification",
          html: getFindMyKYCVerificationTemplate(verificationCode),
        })

        if (!emailResult.success) {
          if (orphanedKYCUser) {
            await db.emailNotification.create({
              data: {
                referenceId:
                  orphanedKYCUser.personaReferenceId || orphanedKYCUser.id,
                type: "KYC_EMAIL_VERIFICATION",
                emailTo: email.toLowerCase(),
                success: false,
                error: emailResult.error,
              },
            })
          }

          return {
            success: false,
            error:
              "Unable to send verification email. Please check your email address and try again later.",
          }
        }

        if (orphanedKYCUser) {
          await db.emailNotification.create({
            data: {
              referenceId:
                orphanedKYCUser.personaReferenceId || orphanedKYCUser.id,
              type: "KYC_EMAIL_VERIFICATION",
              emailTo: email.toLowerCase(),
              success: emailResult.success,
              error: emailResult.error,
            },
          })
        }

        return {
          success: true,
          message: `Verification code sent to ${email}. Please check your inbox and enter the code to link your KYC verification.`,
        }
      } catch (error) {
        console.error("Error sending Find My KYC verification code:", error)
        return {
          success: false,
          error: "An unexpected error occurred. Please try again later.",
        }
      }
    },
    { requireUser: true },
  )
}

export async function validateFindMyKYCCode(
  email: string,
  verificationCode: string,
): Promise<EmailResponse & { kycUser?: any }> {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return { success: false, error: "Unauthorized" }
      }

      try {
        const userEmail = await db.userEmail.findFirst({
          where: {
            userId,
            email: email.toLowerCase(),
            verified: false,
            verificationToken: verificationCode,
            verificationTokenExpiresAt: {
              gt: new Date(),
            },
          },
        })

        if (!userEmail) {
          return {
            success: false,
            error: "Invalid or expired verification code.",
          }
        }

        let orphanedKYCUser: any = null

        try {
          const linkResult = await db.$transaction(async (tx) => {
            const kycUser = await tx.kYCUser.findFirst({
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

            if (!kycUser) {
              throw new Error(
                "KYC verification is no longer available for linking.",
              )
            }

            await tx.userKYCUser.create({
              data: {
                userId,
                kycUserId: kycUser.id,
              },
            })

            return kycUser
          })

          orphanedKYCUser = linkResult
        } catch (transactionError) {
          console.error(
            "Transaction error during KYC linking:",
            transactionError,
          )

          await db.userEmail.delete({
            where: { id: userEmail.id },
          })

          const errorMessage =
            transactionError instanceof Error
              ? transactionError.message
              : "Failed to link KYC verification. Please try again."

          return {
            success: false,
            error: errorMessage,
          }
        }

        await db.userEmail.delete({
          where: { id: userEmail.id },
        })

        revalidatePath("/dashboard")
        revalidatePath("/profile/details")

        return {
          success: true,
          message: "KYC verification successfully linked to your account.",
          kycUser: orphanedKYCUser,
        }
      } catch (error) {
        console.error("Error validating Find My KYC code:", error)
        return {
          success: false,
          error: "Failed to validate verification code. Please try again.",
        }
      }
    },
    { requireUser: true },
  )
}
