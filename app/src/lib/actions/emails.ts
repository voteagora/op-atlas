"use server"

import mailchimp from "@mailchimp/mailchimp_transactional"
import { KYCUser } from "@prisma/client"

import { createPersonaInquiryLink } from "./persona"

const client = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY!)

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
    subject: "Retro Funding: Complete KYC to receive your rewards.",
    html,
  }

  const emailResult = await sendTransactionEmail(emailParams)

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
    subject: "Retro Funding: Complete KYB to receive your rewards.",
    html,
  })

  return emailResult
}

// Template for individual KYC users
function getKYCEmailTemplate(kycUser: KYCUser, kycLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Retro Funding: Complete KYC to Receive Your Rewards</h1>
        <p>Hi ${kycUser.firstName},</p>
        <p>Congratulations again on your Retro Funding allocation!</p>
        <p>In order to receive your OP tokens, you must complete KYC (Know Your Customer) verification for your project.</p>
        <p><strong>To start your KYC process, click the link below:</strong></p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${kycLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Start KYC Verification</a>
        </div>
        <p><strong>Important Notes:</strong></p>
        <ul>
            <li>This link will expire in 7 days</li>
            <li>You can also access KYC functionality on your Project/Org settings under "Grant Address"</li>
            <li>If you encounter any issues, contact retrofunding@optimism.io</li>
        </ul>
        <p>Stay Optimistic.</p>
        <p>Best regards,<br>The OP Atlas Team</p>
    </div>
    `
}

// Template for business KYB users
function getKYBEmailTemplate(kycUser: KYCUser, kycLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Retro Funding: Complete KYB to Receive Your Rewards</h1>
        <p>Hi ${kycUser.firstName},</p>
        <p>Congratulations again on your Retro Funding allocation!</p>
        <p>In order to receive your OP tokens, you must complete KYB (Know Your Business) verification for your project.</p>
        <p><strong>Business Name:</strong> ${kycUser.businessName}</p>
        <p><strong>To start your KYB process, click the link below:</strong></p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${kycLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Start KYB Verification</a>
        </div>
        <p><strong>Important Notes:</strong></p>
        <ul>
            <li>This link will expire in 7 days</li>
            <li>KYB verification requires business documentation and may take longer than individual KYC</li>
            <li>You can also access KYB functionality on your Project/Org settings under "Grant Address"</li>
            <li>If you encounter any issues, contact retrofunding@optimism.io</li>
        </ul>
        <p>Stay Optimistic.</p>
        <p>Best regards,<br>The OP Atlas Team</p>
    </div>
    `
}
