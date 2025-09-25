"use server"

import mailchimp from "@mailchimp/mailchimp_transactional"
import { EmailNotificationType, KYCUser } from "@prisma/client"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { revalidatePath } from "next/cache"
import { createPersonaInquiryLink } from "./persona"
import { getUserProjectRole, getUserOrganizationRole } from "./utils"
import {
  getKYCEmailTemplate,
  getKYCReminderEmailTemplate,
  getKYBEmailTemplate,
  getKYBReminderEmailTemplate,
  getKYCApprovedEmailTemplate,
  getKYBApprovedEmailTemplate,
  getKYCEmailVerificationTemplate,
  getFindMyKYCVerificationTemplate,
} from "@/lib/emailTemplates"

const client = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY!)

// TODO change this to "https://atlas.optimism.io"
const baseUrlForAssets =
  "https://op-atlas-git-kyc-1b-testing-voteagora.vercel.app"

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

export const sendTransactionEmail = async (
  emailData: EmailData,
): Promise<EmailResponse> => {
  try {
    const message = {
      html: emailData.html,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, ""),
      subject: emailData.subject,
      from_email: "compliance@optimism.io",
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
  kycUserId: string
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
  const templateId = process.env.PERSONA_INQUIRY_KYC_TEMPLATE

  if (!templateId) {
    return {
      success: false,
      error:
        "Missing required Persona KYC template ID. Look this up in Persona dashboard.",
    }
  }

  const inquiryResult = await createPersonaInquiryLink(kycUser, templateId)

  if (!inquiryResult.success) {
    return { success: false }
  }

  if (!inquiryResult.inquiryUrl) {
    return { success: false }
  }

  const kycLink = inquiryResult.inquiryUrl

  const html = getKYCEmailTemplate(kycUser, kycLink)

  const emailParams = {
    to: kycUser.email,
    subject: "Action Required: Complete KYC to Unlock Your Optimism Grant",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

  await trackEmailNotification({
    kycUserId: kycUser.id,
    type: "KYCB_STARTED",
    emailTo: kycUser.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export const sendKYBStartedEmail = async (
  kycUser: KYCUser,
): Promise<EmailResponse> => {
  const templateId = process.env.PERSONA_INQUIRY_KYB_TEMPLATE

  if (!templateId) {
    return {
      success: false,
      error: "Missing required Persona KYB template ID",
    }
  }

  const inquiryResult = await createPersonaInquiryLink(kycUser, templateId)

  if (!inquiryResult.success) {
    return { success: false }
  }

  if (!inquiryResult.inquiryUrl) {
    return { success: false }
  }

  const kycLink = inquiryResult.inquiryUrl

  const html = getKYBEmailTemplate(kycUser, kycLink)

  const emailResult = await sendTransactionEmail({
    to: kycUser.email,
    subject: "Action Required: Complete KYB to Unlock Your Optimism Grant",
    html,
  })

  await trackEmailNotification({
    kycUserId: kycUser.id,
    type: "KYCB_STARTED",
    emailTo: kycUser.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
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
      kycUserId: kycUser.id,
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
      error: "A reminder email was already sent within the last 24 hours. Please wait before sending another.",
    }
  }
  const templateId = process.env.PERSONA_INQUIRY_KYC_TEMPLATE

  if (!templateId) {
    return {
      success: false,
      error:
        "Missing required Persona KYC template ID. Look this up in Persona dashboard.",
    }
  }

  const inquiryResult = await createPersonaInquiryLink(kycUser, templateId)

  if (!inquiryResult.success) {
    return { success: false }
  }

  if (!inquiryResult.inquiryUrl) {
    return { success: false }
  }

  const kycLink = inquiryResult.inquiryUrl

  const html = getKYCReminderEmailTemplate(kycUser, kycLink)

  const emailParams = {
    to: kycUser.email,
    subject: "Reminder: Complete Your KYC to Receive Your Optimism Grant",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

  await trackEmailNotification({
    kycUserId: kycUser.id,
    type: "KYCB_REMINDER",
    emailTo: kycUser.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export const sendKYBReminderEmail = async (
  kycUser: KYCUser,
): Promise<EmailResponse> => {
  const templateId = process.env.PERSONA_INQUIRY_KYB_TEMPLATE

  if (!templateId) {
    return {
      success: false,
      error: "Missing required Persona KYB template ID",
    }
  }

  const inquiryResult = await createPersonaInquiryLink(kycUser, templateId)

  if (!inquiryResult.success) {
    return { success: false }
  }

  if (!inquiryResult.inquiryUrl) {
    return { success: false }
  }

  const kycLink = inquiryResult.inquiryUrl

  const html = getKYBReminderEmailTemplate(kycUser, kycLink)

  const emailParams = {
    to: kycUser.email,
    subject: "Reminder: Complete Your KYB to Receive Your Optimism Grant",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

  await trackEmailNotification({
    kycUserId: kycUser.id,
    type: "KYCB_REMINDER",
    emailTo: kycUser.email,
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
    kycUserId: kycUser.id,
    type: "KYCB_APPROVED",
    emailTo: kycUser.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export const sendKYBApprovedEmail = async (
  kycUser: KYCUser,
): Promise<EmailResponse> => {
  const html = getKYBApprovedEmailTemplate(kycUser)

  const emailParams = {
    to: kycUser.email,
    subject: "Verification complete!",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

  await trackEmailNotification({
    kycUserId: kycUser.id,
    type: "KYCB_APPROVED",
    emailTo: kycUser.email,
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
      kycUser: true,
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
      kycUserId: kycUser.id,
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
      error: "A reminder email was already sent within the last 24 hours. Please wait before sending another.",
    }
  }

  const templateId = process.env.PERSONA_INQUIRY_KYC_TEMPLATE

  if (!templateId) {
    return {
      success: false,
      error:
        "Missing required Persona KYC template ID. Look this up in Persona dashboard.",
    }
  }

  const inquiryResult = await createPersonaInquiryLink(kycUser, templateId)

  if (!inquiryResult.success) {
    return { success: false, error: inquiryResult.error }
  }

  if (!inquiryResult.inquiryUrl) {
    return { success: false, error: "Failed to generate verification link" }
  }

  const kycLink = inquiryResult.inquiryUrl

  const html = getKYCReminderEmailTemplate(kycUser, kycLink)

  const emailParams = {
    to: kycUser.email,
    subject: "Reminder: Complete Your KYC to Receive Your Optimism Grant",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

  await trackEmailNotification({
    kycUserId: kycUser.id,
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
    kycUserId,
    type: "KYC_EMAIL_VERIFICATION",
    emailTo: email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export async function sendKYCVerificationEmail(email: string): Promise<EmailResponse> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Validate the orphaned KYC user for this email
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

    // Check if user already has a KYC
    const existingUserKyc = await prisma.userKYCUser.findFirst({
      where: {
        userId,
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

    // Rate limiting check - no more than one verification email per 24 hours for this KYC
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentVerificationEmail = await prisma.emailNotification.findFirst({
      where: {
        kycUserId: orphanedKYCUser.id,
        type: "KYC_EMAIL_VERIFICATION",
        sentAt: {
          gte: twentyFourHoursAgo,
        },
        success: true,
      },
      orderBy: {
        sentAt: "desc",
      },
    })

    if (recentVerificationEmail) {
      return {
        success: false,
        error: "A verification email was already sent within the last 24 hours. Please wait before requesting another.",
      }
    }

    // Delete any existing unverified UserEmail records for this user before creating a new one
    await prisma.userEmail.deleteMany({
      where: {
        userId,
        verified: false,
      },
    })

    // Check if there's already a UserEmail record for this user and email
    let userEmail = await prisma.userEmail.findFirst({
      where: {
        userId,
        email: email.toLowerCase(),
      },
    })

    // Generate verification token and expiry (7 days)
    const verificationToken = crypto.randomUUID()
    const verificationTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    if (userEmail) {
      // Update existing record with new token
      userEmail = await prisma.userEmail.update({
        where: { id: userEmail.id },
        data: {
          verified: false,
          verificationToken,
          verificationTokenExpiresAt,
        },
      })
    } else {
      // Create new UserEmail record
      userEmail = await prisma.userEmail.create({
        data: {
          userId,
          email: email.toLowerCase(),
          verified: false,
          verificationToken,
          verificationTokenExpiresAt,
        },
      })
    }

    // Generate verification link
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const verificationLink = `${baseUrl}/api/kyc/verify-email?token=${verificationToken}`

    // Send verification email
    const emailResult = await sendKYCEmailVerificationEmail(
      email.toLowerCase(),
      orphanedKYCUser.firstName || "User",
      verificationLink,
      orphanedKYCUser.id
    )

    if (emailResult.success) {
      return {
        success: true,
        message: `Verification email sent to ${email}. Please check your inbox and click the link to link your KYC verification.`,
      }
    } else {
      return emailResult
    }
  } catch (error) {
    console.error("Error sending KYC verification email:", error)
    return {
      success: false,
      error: "Failed to send verification email. Please try again.",
    }
  }
}

export const resendKYCVerificationEmail = async (): Promise<EmailResponse> => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Find the UserEmail record with pending verification token for this user
    const userEmail = await prisma.userEmail.findFirst({
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

    if (!userEmail) {
      return {
        success: false,
        error: "No pending email verification found. Please start the process again.",
      }
    }

    // Find the KYCUser for this email to get firstName and kycUserId
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

    // Check rate limiting - email verification emails in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentVerificationEmail = await prisma.emailNotification.findFirst({
      where: {
        kycUserId: kycUser.id,
        type: "KYC_EMAIL_VERIFICATION",
        sentAt: {
          gte: twentyFourHoursAgo,
        },
        success: true,
      },
      orderBy: {
        sentAt: "desc",
      },
    })

    if (recentVerificationEmail) {
      return {
        success: false,
        error: "A verification email was already sent within the last 24 hours. Please wait before requesting another.",
      }
    }

    // Generate verification link with existing token
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const verificationLink = `${baseUrl}/api/kyc/verify-email?token=${userEmail.verificationToken}`

    // Send verification email
    const emailResult = await sendKYCEmailVerificationEmail(
      userEmail.email,
      kycUser.firstName || "User",
      verificationLink,
      kycUser.id
    )

    return emailResult
  } catch (error) {
    console.error("Error resending KYC verification email:", error)
    return {
      success: false,
      error: "Failed to resend verification email. Please try again.",
    }
  }
}

export async function sendFindMyKYCVerificationCode(email: string): Promise<EmailResponse> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Check if user already has a KYC
    const existingUserKyc = await prisma.userKYCUser.findFirst({
      where: {
        userId,
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

    // Check if there's an orphaned KYCUser for this email (for tracking purposes)
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

    // Delete any existing unverified UserEmail records for this user before creating a new one
    await prisma.userEmail.deleteMany({
      where: {
        userId,
        verified: false,
      },
    })

    // Check if there's already a UserEmail record for this user and email
    let userEmail = await prisma.userEmail.findFirst({
      where: {
        userId,
        email: email.toLowerCase(),
      },
    })

    // Generate 6-digit verification code and 10-minute expiry
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
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
      userEmail = await prisma.userEmail.create({
        data: {
          userId,
          email: email.toLowerCase(),
          verified: false,
          verificationToken: verificationCode,
          verificationTokenExpiresAt,
        },
      })
    }

    // Send verification email with code
    const html = getFindMyKYCVerificationTemplate(verificationCode)

    const emailParams = {
      to: email.toLowerCase(),
      subject: "Verify your email to link your KYC verification",
      html,
    }

    const emailResult = await sendTransactionEmail(emailParams)

    // Track email notification if we found an orphaned KYC user
    if (orphanedKYCUser) {
      await trackEmailNotification({
        kycUserId: orphanedKYCUser.id,
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
      error: "Failed to send verification code. Please try again.",
    }
  }
}

export async function validateFindMyKYCCode(email: string, verificationCode: string): Promise<EmailResponse & { kycUser?: any }> {
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

    // Find the orphaned KYCUser for this email
    const orphanedKYCUser = await prisma.kYCUser.findFirst({
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

    if (!orphanedKYCUser) {
      // Clear the verification token since KYC is no longer available
      await prisma.userEmail.update({
        where: { id: userEmail.id },
        data: {
          verificationToken: null,
          verificationTokenExpiresAt: null,
        },
      })

      return {
        success: false,
        error: "KYC verification is no longer available for linking.",
      }
    }

    // Link the KYCUser to the current user
    await prisma.userKYCUser.create({
      data: {
        userId,
        kycUserId: orphanedKYCUser.id,
      },
    })

    // Mark the email as verified and clear the verification token
    await prisma.userEmail.update({
      where: { id: userEmail.id },
      data: {
        verified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
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