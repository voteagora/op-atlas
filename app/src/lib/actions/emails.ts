"use server"

import mailchimp from "@mailchimp/mailchimp_transactional"
import { PrismaClient, EmailNotificationType, KYCLegalEntity, KYCUser } from "@prisma/client"
import { revalidatePath } from "next/cache"

import {
  getFindMyKYCVerificationTemplate,
  getKYBApprovedEmailTemplate,
  getKYBEmailTemplate,
  getKYBReminderEmailTemplate,
  getKYCApprovedEmailTemplate,
  getKYCEmailTemplate,
  getKYCEmailVerificationTemplate,
  getKYCReminderEmailTemplate,
} from "@/lib/emailTemplates"
import { generateKYCToken } from "@/lib/utils/kycToken"
import { withImpersonation } from "@/lib/db/sessionContext"
import { getUserOrganizationRole, getUserProjectRole } from "./utils"

const client = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY!)

// Base URL for the application
const BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_VERCEL_URL
  if (!url) return "https://atlas.optimism.io"
  if (url.startsWith("http")) return url
  if (url.includes("localhost")) return `http://${url}`
  return `https://${url}`
})()

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export interface EmailResponse {
  success: boolean
  error?: string
  message?: string
}

const EMAIL_BCC_RECIPIENTS = [
  { email: "lucas@voteagora.com", type: "bcc" as const },
  { email: "jeff@voteagora.com", type: "bcc" as const },
]

type LegalEntityWithController = KYCLegalEntity & {
  kycLegalEntityController: {
    firstName: string
    lastName: string
    email: string
  } | null
}

export const sendTransactionEmail = async (
  emailData: EmailData,
): Promise<EmailResponse> => {
  try {
    const message = {
      html: emailData.html,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, ""),
      subject: emailData.subject,
      from_email: "compliance@optimism.io",
      from_name: "Optimism",
      to: [{ email: emailData.to, type: "to" as const }, ...EMAIL_BCC_RECIPIENTS],
      reply_to: "compliance@optimism.io.",
    }

    const response = await client.messages.send({ message })

    console.log({ response })

    if ("isAxiosError" in response) {
      return {
        success: false,
        error: response.message || "Failed to send email",
      }
    }

    if (Array.isArray(response)) {
      if (response.length > 0 && response[0].status === "sent") {
        return { success: true }
      } else if (response.length > 0 && response[0].status === "rejected") {
        const rejectReason = (response[0] as any).reject_reason || "unknown"
        return {
          success: false,
          error: `Email rejected: ${rejectReason}`,
        }
      }
    }

    return {
      success: false,
      error: "Failed to send email",
    }
  } catch (error) {
    console.error("Error sending email", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

async function trackEmailNotification(
  db: PrismaClient,
  params: {
  referenceId: string
  type: EmailNotificationType
  emailTo: string
  success: boolean
  error?: string
}): Promise<void> {
  try {
    await db.emailNotification.create({
      data: params,
    })
  } catch (error) {
    console.error("Failed to track email notification:", error)
  }
}

export const sendKYCStartedEmail = async (
  kycUser: KYCUser,
): Promise<EmailResponse> => {
  return withImpersonation(async ({ db }) => {
    try {
      const token = await generateKYCToken("kycUser", kycUser.id, kycUser.email)
      const kycLink = `${BASE_URL}/kyc/verify/${token}`

      const html = getKYCEmailTemplate(kycUser, kycLink)

      const emailParams = {
        to: kycUser.email,
        subject: "Action Required: Complete KYC to Unlock Your Optimism Grant",
        html,
      }

      const emailResult = await sendTransactionEmail(emailParams)

      await trackEmailNotification(db, {
        referenceId: kycUser.personaReferenceId || kycUser.id,
        type: "KYCB_STARTED",
        emailTo: kycUser.email,
        success: emailResult.success,
        error: emailResult.error,
      })

      return emailResult
    } catch (error) {
      console.error("Error sending KYC started email:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send email"

      await trackEmailNotification(db, {
        referenceId: kycUser.personaReferenceId || kycUser.id,
        type: "KYCB_STARTED",
        emailTo: kycUser.email,
        success: false,
        error: errorMessage,
      })

      return {
        success: false,
        error: errorMessage,
      }
    }
  })
}

export const sendKYBStartedEmail = async (
  legalEntity: KYCLegalEntity & {
    kycLegalEntityController: {
      firstName: string
      lastName: string
      email: string
    }
  },
): Promise<EmailResponse> => {
  return withImpersonation(async ({ db }) => {
    try {
      const token = await generateKYCToken(
        "legalEntity",
        legalEntity.id,
        legalEntity.kycLegalEntityController.email,
      )
      const kycLink = `${BASE_URL}/kyc/verify/${token}`

      const html = getKYBEmailTemplate({
        firstName: legalEntity.kycLegalEntityController.firstName,
        businessName: legalEntity.name,
        kycLink,
      })

      const emailResult = await sendTransactionEmail({
        to: legalEntity.kycLegalEntityController.email,
        subject: "Action Required: Complete KYB to Unlock Your Optimism Grant",
        html,
      })

      await trackEmailNotification(db, {
        referenceId: legalEntity.personaReferenceId || legalEntity.id,
        type: "KYCB_STARTED",
        emailTo: legalEntity.kycLegalEntityController.email,
        success: emailResult.success,
        error: emailResult.error,
      })

      return emailResult
    } catch (error) {
      console.error("Error sending KYB started email:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send email"

      await trackEmailNotification(db, {
        referenceId: legalEntity.personaReferenceId || legalEntity.id,
        type: "KYCB_STARTED",
        emailTo: legalEntity.kycLegalEntityController.email,
        success: false,
        error: errorMessage,
      })

      return {
        success: false,
        error: errorMessage,
      }
    }
  })
}

export const sendKYCReminderEmail = async (
  kycUser: KYCUser,
  context: {
    projectId?: string
    organizationId?: string
    bypassAuth?: boolean
  },
): Promise<EmailResponse> => {
  const bypassAuth = !!context?.bypassAuth
  return withImpersonation(
    async ({ db, userId }) => {
      if (!bypassAuth) {
        if (!userId) {
          return {
            success: false,
            error: "Unauthorized",
          }
        }

        if (context.projectId) {
          const userRole = await getUserProjectRole(context.projectId, userId, db)
          if (userRole !== "admin") {
            return {
              success: false,
              error: "Unauthorized - Project admin access required",
            }
          }
        } else if (context.organizationId) {
          const userRole = await getUserOrganizationRole(
            context.organizationId,
            userId,
            db,
          )
          if (userRole !== "admin") {
            return {
              success: false,
              error: "Unauthorized - Organization admin access required",
            }
          }
        } else {
          return {
            success: false,
            error: "Missing context - projectId or organizationId required",
          }
        }
      }

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentReminder = await db.emailNotification.findFirst({
        where: {
          referenceId: kycUser.personaReferenceId || kycUser.id,
          type: "KYCB_REMINDER",
          sentAt: {
            gte: twentyFourHoursAgo,
          },
          success: true,
        },
        orderBy: {
          sentAt: "desc",
        },
      })

      if (recentReminder) {
        return {
          success: false,
          error:
            "A reminder email was already sent within the last 24 hours. Please wait before sending another.",
        }
      }

      const token = await generateKYCToken("kycUser", kycUser.id, kycUser.email)
      const kycLink = `${BASE_URL}/kyc/verify/${token}`

      const html = getKYCReminderEmailTemplate(kycUser, kycLink)

      const emailParams = {
        to: kycUser.email,
        subject: "Reminder: Complete Your KYC to Receive Your Optimism Grant",
        html,
      }

      const emailResult = await sendTransactionEmail(emailParams)

      await trackEmailNotification(db, {
        referenceId: kycUser.personaReferenceId || kycUser.id,
        type: "KYCB_REMINDER",
        emailTo: kycUser.email,
        success: emailResult.success,
        error: emailResult.error,
      })

      return emailResult
    },
    {
      requireUser: !bypassAuth,
      forceProd: bypassAuth,
    },
  )
}

export const sendKYBReminderEmail = async (
  legalEntityInput: LegalEntityWithController | { id: string },
  context: {
    projectId?: string
    organizationId?: string
    bypassAuth?: boolean
  } = {},
): Promise<EmailResponse> => {
  const { bypassAuth, projectId, organizationId } = context ?? {}
  const forceProd = !!bypassAuth

  return withImpersonation(
    async ({ db, userId }) => {
      if (!bypassAuth) {
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
        } else if (organizationId) {
          const userRole = await getUserOrganizationRole(organizationId, userId, db)
          if (userRole !== "admin") {
            return {
              success: false,
              error: "Unauthorized - Organization admin access required",
            }
          }
        } else {
          return {
            success: false,
            error: "Missing context - projectId or organizationId required",
          }
        }
      }

      const legalEntityId = legalEntityInput.id
      let legalEntity: LegalEntityWithController | null =
        "kycLegalEntityController" in legalEntityInput
          ? (legalEntityInput as LegalEntityWithController)
          : null

      if (!legalEntity?.kycLegalEntityController) {
        legalEntity = (await db.kYCLegalEntity.findUnique({
          where: { id: legalEntityId },
          include: {
            kycLegalEntityController: true,
          },
        })) as LegalEntityWithController | null
      }

      if (!legalEntity) {
        return {
          success: false,
          error: "Legal entity not found",
        }
      }

      if (!legalEntity.kycLegalEntityController) {
        return {
          success: false,
          error: "Legal entity controller not found",
        }
      }

      if (legalEntity.status === "APPROVED") {
        return {
          success: false,
          error: "Cannot resend email for already approved verification",
        }
      }

      const referenceId = legalEntity.personaReferenceId || legalEntity.id

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentReminder = await db.emailNotification.findFirst({
        where: {
          referenceId,
          type: "KYCB_REMINDER",
          sentAt: {
            gte: twentyFourHoursAgo,
          },
          success: true,
        },
        orderBy: {
          sentAt: "desc",
        },
      })

      if (recentReminder) {
        return {
          success: false,
          error:
            "A reminder email was already sent within the last 24 hours. Please wait before sending another.",
        }
      }

      const token = await generateKYCToken(
        "legalEntity",
        legalEntity.id,
        legalEntity.kycLegalEntityController.email,
      )
      const kycLink = `${BASE_URL}/kyc/verify/${token}`

      const html = getKYBReminderEmailTemplate({
        firstName: legalEntity.kycLegalEntityController.firstName,
        kycLink,
      })

      const emailParams = {
        to: legalEntity.kycLegalEntityController.email,
        subject: "Reminder: Complete Your KYB to Receive Your Optimism Grant",
        html,
      }

      const emailResult = await sendTransactionEmail(emailParams)

      await trackEmailNotification(db, {
        referenceId: legalEntity.personaReferenceId || legalEntity.id,
        type: "KYCB_REMINDER",
        emailTo: legalEntity.kycLegalEntityController.email,
        success: emailResult.success,
        error: emailResult.error,
      })

      return emailResult
    },
    {
      requireUser: !bypassAuth,
      forceProd,
    },
  )
}

export const sendKYCApprovedEmail = async (
  kycUser: KYCUser,
): Promise<EmailResponse> => {
  return withImpersonation(async ({ db }) => {
    const html = getKYCApprovedEmailTemplate(kycUser)

    const emailParams = {
      to: kycUser.email,
      subject: "Verification complete!",
      html,
    }

    const emailResult = await sendTransactionEmail(emailParams)

    await trackEmailNotification(db, {
      referenceId: kycUser.personaReferenceId || kycUser.id,
      type: "KYCB_APPROVED",
      emailTo: kycUser.email,
      success: emailResult.success,
      error: emailResult.error,
    })

    return emailResult
  })
}

export const sendKYBApprovedEmail = async (
  firstName: string,
  email: string,
  referenceId: string,
): Promise<EmailResponse> => {
  return withImpersonation(async ({ db }) => {
    const html = getKYBApprovedEmailTemplate(firstName)

    const emailParams = {
      to: email,
      subject: "Verification complete!",
      html,
    }

    const emailResult = await sendTransactionEmail(emailParams)

    await trackEmailNotification(db, {
      referenceId,
      type: "KYCB_APPROVED",
      emailTo: email,
      success: emailResult.success,
      error: emailResult.error,
    })

    return emailResult
  })
}

export const sendPersonalKYCReminderEmail = async (
  kycUserId: string,
): Promise<EmailResponse> => {
  return withImpersonation(async ({ db, userId }) => {
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
        kycUser: {
          include: {
            KYCUserTeams: true,
            UserKYCUsers: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    if (!userKycUser) {
      return {
        success: false,
        error: "KYC verification not found or unauthorized",
      }
    }

    const kycUser = userKycUser.kycUser

    if (kycUser.status === "APPROVED") {
      return {
        success: false,
        error: "Cannot resend email for already approved verification",
      }
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentReminder = await db.emailNotification.findFirst({
      where: {
        referenceId: kycUser.personaReferenceId || kycUser.id,
        type: "KYCB_REMINDER",
        sentAt: {
          gte: twentyFourHoursAgo,
        },
        success: true,
      },
      orderBy: {
        sentAt: "desc",
      },
    })

    if (recentReminder) {
      return {
        success: false,
        error:
          "A reminder email was already sent within the last 24 hours. Please wait before sending another.",
      }
    }

    const token = await generateKYCToken("kycUser", kycUser.id, kycUser.email)
    const kycLink = `${BASE_URL}/kyc/verify/${token}`

    const html = getKYCReminderEmailTemplate(kycUser, kycLink)

    const emailParams = {
      to: kycUser.email,
      subject: "Reminder: Complete Your KYC to Receive Your Optimism Grant",
      html,
    }

    const emailResult = await sendTransactionEmail(emailParams)

    await trackEmailNotification(db, {
      referenceId: kycUser.personaReferenceId || kycUser.id,
      type: "KYCB_REMINDER",
      emailTo: kycUser.email,
      success: emailResult.success,
      error: emailResult.error,
    })

    return emailResult
  }, { requireUser: true })
}

export const sendKYCEmailVerificationEmail = async (
  email: string,
  firstName: string,
  verificationLink: string,
  kycUserId: string,
): Promise<EmailResponse> => {
  return withImpersonation(async ({ db }) => {
    const html = getKYCEmailVerificationTemplate(firstName, verificationLink)

    const emailParams = {
      to: email,
      subject: "Verify your email to link your KYC verification",
      html,
    }

    const emailResult = await sendTransactionEmail(emailParams)

    await trackEmailNotification(db, {
      referenceId: kycUserId,
      type: "KYC_EMAIL_VERIFICATION",
      emailTo: email,
      success: emailResult.success,
      error: emailResult.error,
    })

    return emailResult
  })
}

export async function sendFindMyKYCVerificationCode(
  email: string,
): Promise<EmailResponse> {
  return withImpersonation(async ({ db, userId }) => {
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

      const html = getFindMyKYCVerificationTemplate(verificationCode)

      const emailParams = {
        to: email.toLowerCase(),
        subject: "Verify your email to link your KYC verification",
        html,
      }

      const emailResult = await sendTransactionEmail(emailParams)

      if (!emailResult.success) {
        if (orphanedKYCUser) {
          await trackEmailNotification(db, {
            referenceId:
              orphanedKYCUser.personaReferenceId || orphanedKYCUser.id,
            type: "KYC_EMAIL_VERIFICATION",
            emailTo: email.toLowerCase(),
            success: false,
            error: emailResult.error,
          })
        }

        return {
          success: false,
          error:
            "Unable to send verification email. Please check your email address and try again later.",
        }
      }

      if (orphanedKYCUser) {
        await trackEmailNotification(db, {
          referenceId:
            orphanedKYCUser.personaReferenceId || orphanedKYCUser.id,
          type: "KYC_EMAIL_VERIFICATION",
          emailTo: email.toLowerCase(),
          success: emailResult.success,
          error: emailResult.error,
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
  }, { requireUser: true })
}

export async function validateFindMyKYCCode(
  email: string,
  verificationCode: string,
): Promise<EmailResponse & { kycUser?: any }> {
  return withImpersonation(async ({ db, userId }) => {
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
        console.error("Transaction error during KYC linking:", transactionError)

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
  }, { requireUser: true })
}
