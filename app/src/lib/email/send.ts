import "server-only"

import mailchimp from "@mailchimp/mailchimp_transactional"
import {
  EmailNotificationType,
  KYCLegalEntity,
  KYCUser,
  PrismaClient,
} from "@prisma/client"

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

const client = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY!)

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

export type KycReminderUser = Pick<KYCUser, "id" | "email" | "personaReferenceId">

export type LegalEntityWithController = KYCLegalEntity & {
  kycLegalEntityController: {
    firstName: string
    lastName: string
    email: string
  } | null
}

async function trackEmailNotification(
  db: PrismaClient,
  params: {
    referenceId: string
    type: EmailNotificationType
    emailTo: string
    success: boolean
    error?: string
  },
): Promise<void> {
  try {
    await db.emailNotification.create({
      data: params,
    })
  } catch (error) {
    console.error("Failed to track email notification:", error)
  }
}

export async function sendTransactionEmail(
  emailData: EmailData,
): Promise<EmailResponse> {
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

    if ("isAxiosError" in response) {
      return {
        success: false,
        error: response.message || "Failed to send email",
      }
    }

    if (Array.isArray(response)) {
      if (response.length > 0 && response[0].status === "sent") {
        return { success: true }
      }

      if (response.length > 0 && response[0].status === "rejected") {
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

export async function sendKYCStartedEmail(
  kycUser: KYCUser,
  db: PrismaClient = prisma,
): Promise<EmailResponse> {
  try {
    const token = await generateKYCToken("kycUser", kycUser.id, kycUser.email)
    const kycLink = `${BASE_URL}/kyc/verify/${token}`

    const html = getKYCEmailTemplate(kycUser, kycLink)
    const emailResult = await sendTransactionEmail({
      to: kycUser.email,
      subject: "Action Required: Complete KYC to Unlock Your Optimism Grant",
      html,
    })

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
}

export async function sendKYBStartedEmail(
  legalEntity: KYCLegalEntity & {
    kycLegalEntityController: {
      firstName: string
      lastName: string
      email: string
    }
  },
  db: PrismaClient = prisma,
): Promise<EmailResponse> {
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
}

export async function sendKYCReminderEmailInternal(
  kycUser: KycReminderUser,
  db: PrismaClient = prisma,
): Promise<EmailResponse> {
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
  const emailResult = await sendTransactionEmail({
    to: kycUser.email,
    subject: "Reminder: Complete Your KYC to Receive Your Optimism Grant",
    html,
  })

  await trackEmailNotification(db, {
    referenceId: kycUser.personaReferenceId || kycUser.id,
    type: "KYCB_REMINDER",
    emailTo: kycUser.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export async function sendKYBReminderEmailInternal(
  legalEntityInput: LegalEntityWithController | { id: string },
  db: PrismaClient = prisma,
): Promise<EmailResponse> {
  const legalEntityId = legalEntityInput.id
  let legalEntity: LegalEntityWithController | null =
    "kycLegalEntityController" in legalEntityInput ? legalEntityInput : null

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
  const emailResult = await sendTransactionEmail({
    to: legalEntity.kycLegalEntityController.email,
    subject: "Reminder: Complete Your KYB to Receive Your Optimism Grant",
    html,
  })

  await trackEmailNotification(db, {
    referenceId,
    type: "KYCB_REMINDER",
    emailTo: legalEntity.kycLegalEntityController.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export async function sendKYCApprovedEmail(
  kycUser: KYCUser,
  db: PrismaClient = prisma,
): Promise<EmailResponse> {
  const html = getKYCApprovedEmailTemplate(kycUser)
  const emailResult = await sendTransactionEmail({
    to: kycUser.email,
    subject: "Verification complete!",
    html,
  })

  await trackEmailNotification(db, {
    referenceId: kycUser.personaReferenceId || kycUser.id,
    type: "KYCB_APPROVED",
    emailTo: kycUser.email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export async function sendKYBApprovedEmail(
  firstName: string,
  email: string,
  referenceId: string,
  db: PrismaClient = prisma,
): Promise<EmailResponse> {
  const html = getKYBApprovedEmailTemplate(firstName)
  const emailResult = await sendTransactionEmail({
    to: email,
    subject: "Verification complete!",
    html,
  })

  await trackEmailNotification(db, {
    referenceId,
    type: "KYCB_APPROVED",
    emailTo: email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}

export async function sendKYCEmailVerificationEmail(
  email: string,
  firstName: string,
  verificationLink: string,
  kycUserId: string,
  db: PrismaClient = prisma,
): Promise<EmailResponse> {
  const html = getKYCEmailVerificationTemplate(firstName, verificationLink)
  const emailResult = await sendTransactionEmail({
    to: email,
    subject: "Verify your email to link your KYC verification",
    html,
  })

  await trackEmailNotification(db, {
    referenceId: kycUserId,
    type: "KYC_EMAIL_VERIFICATION",
    emailTo: email,
    success: emailResult.success,
    error: emailResult.error,
  })

  return emailResult
}
