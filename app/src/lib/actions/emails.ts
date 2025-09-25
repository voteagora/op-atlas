"use server"

import mailchimp from "@mailchimp/mailchimp_transactional"
import { EmailNotificationType, KYCUser } from "@prisma/client"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { createPersonaInquiryLink } from "./persona"
import { getUserProjectRole, getUserOrganizationRole } from "./utils"
import {
  getKYCEmailTemplate,
  getKYCReminderEmailTemplate,
  getKYBEmailTemplate,
  getKYBReminderEmailTemplate,
  getKYCApprovedEmailTemplate,
  getKYBApprovedEmailTemplate,
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
    referenceId: kycUser.id,
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
    referenceId: kycUser.id,
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
    referenceId: kycUser.id,
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
    referenceId: kycUser.id,
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
    referenceId: kycUser.id,
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
    referenceId: kycUser.id,
    type: "KYCB_APPROVED",
    emailTo: kycUser.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

// Send KYB reminder for a Legal Entity without requiring a KYCUser DB record
export const sendKYBReminderEmailForLegalEntity = async (params: {
  id: string // use LegalEntity.id as reference-id
  email: string
  firstName: string
  lastName: string
  businessName?: string
}): Promise<EmailResponse> => {
  const templateId = process.env.PERSONA_INQUIRY_KYB_TEMPLATE

  if (!templateId) {
    return {
      success: false,
      error: "Missing required Persona KYB template ID",
    }
  }

  // Construct a pseudo KYCUser payload for Persona/reference only
  const pseudoUser = {
    id: params.id,
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    businessName: params.businessName || null,
    status: "PENDING",
    expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    personaStatus: null,
    KYCUserTeams: [],
  } as unknown as KYCUser

  const inquiryResult = await createPersonaInquiryLink(pseudoUser, templateId)
  if (!inquiryResult.success || !inquiryResult.inquiryUrl) {
    return { success: false, error: inquiryResult.error }
  }

  const html = getKYBReminderEmailTemplate(pseudoUser, inquiryResult.inquiryUrl)

  const emailParams = {
    to: params.email,
    subject: "Reminder: Complete Your KYB to Receive Your Optimism Grant",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

  await trackEmailNotification({
    referenceId: params.id,
    type: "KYCB_REMINDER",
    emailTo: params.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

// Send KYB started email for a Legal Entity without requiring a KYCUser DB record
export const sendKYBStartedEmailForLegalEntity = async (params: {
  id: string // use LegalEntity.id as reference-id
  email: string
  firstName: string
  lastName: string
  businessName?: string
}): Promise<EmailResponse> => {
  const templateId = process.env.PERSONA_INQUIRY_KYB_TEMPLATE

  if (!templateId) {
    return {
      success: false,
      error: "Missing required Persona KYB template ID",
    }
  }

  // Construct a pseudo KYCUser payload for Persona/reference only
  const pseudoUser = {
    id: params.id,
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    businessName: params.businessName || null,
    status: "PENDING",
    expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    personaStatus: null,
    KYCUserTeams: [],
  } as unknown as import("@prisma/client").KYCUser

  const inquiryResult = await createPersonaInquiryLink(pseudoUser, templateId)
  if (!inquiryResult.success || !inquiryResult.inquiryUrl) {
    return { success: false, error: inquiryResult.error }
  }

  const html = getKYBEmailTemplate(pseudoUser, inquiryResult.inquiryUrl)

  const emailParams = {
    to: params.email,
    subject: "Action Required: Complete KYB to Unlock Your Optimism Grant",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

  await trackEmailNotification({
    referenceId: params.id,
    type: "KYCB_STARTED",
    emailTo: params.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}
