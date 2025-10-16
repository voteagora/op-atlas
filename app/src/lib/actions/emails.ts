"use server"

import mailchimp from "@mailchimp/mailchimp_transactional"
import { EmailNotificationType, KYCLegalEntity, KYCUser } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
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
      to: [{ email: emailData.to, type: "to" as const }],
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

async function trackEmailNotification(params: {
  referenceId: string
  type: EmailNotificationType
  emailTo: string
  success: boolean
  error?: string
}): Promise<void> {
  try {
    await prisma.emailNotification.create({
      data: params,
    })
  } catch (error) {
    console.error("Failed to track email notification:", error)
  }
}

export const sendKYCStartedEmail = async (
  kycUser: KYCUser,
): Promise<EmailResponse> => {
  try {
    // Generate secure token for KYC verification gateway
    const token = await generateKYCToken("kycUser", kycUser.id, kycUser.email)
    const kycLink = `${BASE_URL}/kyc/verify/${token}`

    const html = getKYCEmailTemplate(kycUser, kycLink)

    const emailParams = {
      to: kycUser.email,
      subject: "Action Required: Complete KYC to Unlock Your Optimism Grant",
      html,
    }

    const emailResult = await sendTransactionEmail(emailParams)

    await trackEmailNotification({
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

    await trackEmailNotification({
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
  try {
    // Generate secure token for KYB verification gateway
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

    await trackEmailNotification({
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

    await trackEmailNotification({
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
}

export const sendKYCReminderEmail = async (
  kycUser: KYCUser,
  context: {
    projectId?: string
    organizationId?: string
    bypassAuth?: boolean
  },
): Promise<EmailResponse> => {
  // Check authentication and admin permissions unless bypassed
  if (!context?.bypassAuth) {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    const userId = session.user.id

    // Verify admin permissions based on context
    if (context.projectId) {
      const userRole = await getUserProjectRole(context.projectId, userId)
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

  // Rate limiting: Check if a reminder email was already sent in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentReminder = await prisma.emailNotification.findFirst({
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
  // Generate secure token for KYC verification gateway
  const token = await generateKYCToken("kycUser", kycUser.id, kycUser.email)
  const kycLink = `${BASE_URL}/kyc/verify/${token}`

  const html = getKYCReminderEmailTemplate(kycUser, kycLink)

  const emailParams = {
    to: kycUser.email,
    subject: "Reminder: Complete Your KYC to Receive Your Optimism Grant",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

  await trackEmailNotification({
    referenceId: kycUser.personaReferenceId || kycUser.id,
    type: "KYCB_REMINDER",
    emailTo: kycUser.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
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

  if (!bypassAuth) {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    const userId = session.user.id

    if (projectId) {
      const userRole = await getUserProjectRole(projectId, userId)
      if (userRole !== "admin") {
        return {
          success: false,
          error: "Unauthorized - Project admin access required",
        }
      }
    } else if (organizationId) {
      const userRole = await getUserOrganizationRole(organizationId, userId)
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
    legalEntity = (await prisma.kYCLegalEntity.findUnique({
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
  const recentReminder = await prisma.emailNotification.findFirst({
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

  // Generate secure token for KYB verification gateway
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

  await trackEmailNotification({
    referenceId: legalEntity.personaReferenceId || legalEntity.id,
    type: "KYCB_REMINDER",
    emailTo: legalEntity.kycLegalEntityController.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export const sendKYCApprovedEmail = async (
  kycUser: KYCUser,
): Promise<EmailResponse> => {
  const html = getKYCApprovedEmailTemplate(kycUser)

  const emailParams = {
    to: kycUser.email,
    subject: "Verification complete!",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

  await trackEmailNotification({
    referenceId: kycUser.personaReferenceId || kycUser.id,
    type: "KYCB_APPROVED",
    emailTo: kycUser.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export const sendKYBApprovedEmail = async (
  firstName: string,
  email: string,
  referenceId: string,
): Promise<EmailResponse> => {
  const html = getKYBApprovedEmailTemplate(firstName)

  const emailParams = {
    to: email,
    subject: "Verification complete!",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

  await trackEmailNotification({
    referenceId,
    type: "KYCB_APPROVED",
    emailTo: email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export const sendPersonalKYCReminderEmail = async (
  kycUserId: string,
): Promise<EmailResponse> => {
  // Check authentication - user can only resend email for their own KYC
  const session = await auth()
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    }
  }

  const userId = session.user.id

  // Verify that this KYCUser belongs to the authenticated user
  const userKycUser = await prisma.userKYCUser.findFirst({
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

  // Don't allow resending for approved users
  if (kycUser.status === "APPROVED") {
    return {
      success: false,
      error: "Cannot resend email for already approved verification",
    }
  }

  // Rate limiting: Check if a reminder email was already sent in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentReminder = await prisma.emailNotification.findFirst({
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

  // Generate secure token for KYC verification gateway
  const token = await generateKYCToken("kycUser", kycUser.id, kycUser.email)
  const kycLink = `${BASE_URL}/kyc/verify/${token}`

  const html = getKYCReminderEmailTemplate(kycUser, kycLink)

  const emailParams = {
    to: kycUser.email,
    subject: "Reminder: Complete Your KYC to Receive Your Optimism Grant",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

  await trackEmailNotification({
    referenceId: kycUser.personaReferenceId || kycUser.id,
    type: "KYCB_REMINDER",
    emailTo: kycUser.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export const sendKYCEmailVerificationEmail = async (
  email: string,
  firstName: string,
  verificationLink: string,
  kycUserId: string,
): Promise<EmailResponse> => {
  const html = getKYCEmailVerificationTemplate(firstName, verificationLink)

  const emailParams = {
    to: email,
    subject: "Verify your email to link your KYC verification",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

  await trackEmailNotification({
    referenceId: kycUserId,
    type: "KYC_EMAIL_VERIFICATION",
    emailTo: email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export async function sendFindMyKYCVerificationCode(
  email: string,
): Promise<EmailResponse> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // 1. Check if user already has a KYC
    const existingUserKyc = await prisma.userKYCUser.findFirst({
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

    // 2. Check if current user already has a VERIFIED email with this address
    const existingVerifiedEmail = await prisma.userEmail.findFirst({
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

    // 3. Check if email exists for ANY other user
    // IMPORTANT: Don't reveal that this email exists in the database (privacy/security)
    const emailUsedByOtherUser = await prisma.userEmail.findFirst({
      where: {
        email: email.toLowerCase(),
        userId: {
          not: userId,
        },
      },
    })

    if (emailUsedByOtherUser) {
      // Generic error that doesn't reveal the email exists in our system
      return {
        success: false,
        error:
          "Unable to process this email address. Please try a different email or contact support if you believe this is an error.",
      }
    }

    // 4. Check if there's an orphaned KYCUser for this email (for tracking purposes)
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

    // 5. Delete any existing unverified UserEmail records for this user before creating a new one
    await prisma.userEmail.deleteMany({
      where: {
        userId,
        verified: false,
      },
    })

    // 6. Check if there's already a UserEmail record for this user and email
    let userEmail = await prisma.userEmail.findFirst({
      where: {
        userId,
        email: email.toLowerCase(),
      },
    })

    // 7. Generate 6-digit verification code and 10-minute expiry
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString()
    const verificationTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    if (userEmail) {
      // Update existing record with new code
      userEmail = await prisma.userEmail.update({
        where: { id: userEmail.id },
        data: {
          verified: false,
          verificationToken: verificationCode,
          verificationTokenExpiresAt,
        },
      })
    } else {
      // Create new UserEmail record
      // This could still fail if there's a race condition, so wrap in try/catch
      try {
        userEmail = await prisma.userEmail.create({
          data: {
            userId,
            email: email.toLowerCase(),
            verified: false,
            verificationToken: verificationCode,
            verificationTokenExpiresAt,
          },
        })
      } catch (createError) {
        // If unique constraint violation, it means another user claimed this email
        // in a race condition scenario
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
        // Re-throw if it's a different error
        throw createError
      }
    }

    // 8. Send verification email with code
    const html = getFindMyKYCVerificationTemplate(verificationCode)

    const emailParams = {
      to: email.toLowerCase(),
      subject: "Verify your email to link your KYC verification",
      html,
    }

    const emailResult = await sendTransactionEmail(emailParams)

    if (!emailResult.success) {
      // Email sending failed, track the notification if we have an orphaned KYC user
      if (orphanedKYCUser) {
        await trackEmailNotification({
          referenceId: orphanedKYCUser.personaReferenceId || orphanedKYCUser.id,
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

    // Track email notification if we found an orphaned KYC user
    if (orphanedKYCUser) {
      await trackEmailNotification({
        referenceId: orphanedKYCUser.personaReferenceId || orphanedKYCUser.id,
        type: "KYC_EMAIL_VERIFICATION",
        emailTo: email.toLowerCase(),
        success: emailResult.success,
        error: emailResult.error,
      })
    }

    // Always return success to not reveal whether KYC exists for this email
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
}

export async function validateFindMyKYCCode(
  email: string,
  verificationCode: string,
): Promise<EmailResponse & { kycUser?: any }> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Find the UserEmail record with the matching code
    const userEmail = await prisma.userEmail.findFirst({
      where: {
        userId,
        email: email.toLowerCase(),
        verified: false,
        verificationToken: verificationCode,
        verificationTokenExpiresAt: {
          gt: new Date(), // Token not expired
        },
      },
    })

    if (!userEmail) {
      return {
        success: false,
        error: "Invalid or expired verification code.",
      }
    }

    // Use transaction to atomically check if KYCUser is orphaned and create link
    // This prevents race conditions where multiple users try to link simultaneously
    let orphanedKYCUser: any = null

    try {
      const linkResult = await prisma.$transaction(async (tx) => {
        // Re-check if KYCUser is still orphaned within the transaction
        const kycUser = await tx.kYCUser.findFirst({
          where: {
            email: email.toLowerCase(),
            expiry: {
              gt: new Date(), // Not expired
            },
            UserKYCUsers: {
              none: {}, // Still orphaned
            },
          },
        })

        if (!kycUser) {
          throw new Error(
            "KYC verification is no longer available for linking.",
          )
        }

        // Atomically create the link
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

      // Always delete the UserEmail record after verification attempt
      // This prevents conflicts with Privy sync and maintains single-email assumption
      await prisma.userEmail.delete({
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

    // Always delete the UserEmail record after successful verification
    // This prevents conflicts with Privy sync and maintains single-email assumption
    await prisma.userEmail.delete({
      where: { id: userEmail.id },
    })

    // Revalidate pages that show KYC status
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
}
