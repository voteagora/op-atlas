"use server"

import mailchimp from "@mailchimp/mailchimp_transactional"
import { KYCUser } from "@prisma/client"

import { createPersonaInquiryLink } from "./persona"

// Initialize Mailchimp Transactional client (requires transactional API key)
const client = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY || "")

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
  messageId?: string
  error?: string
}

/**
 * Send a transactional email using Mailchimp
 */
export const sendTransactionEmail = async (
  emailData: EmailData,
): Promise<EmailResponse> => {
  try {
    const message = {
      html: emailData.html,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, ""),
      subject: emailData.subject,
      from_email: emailData.from || "noreply@optimism.io",
      to: [{ email: emailData.to, type: "to" as const }],
      ...(emailData.replyTo && { reply_to: emailData.replyTo }),
    }

    const response = await client.messages.send({ message })

    // Check if response is an error
    if ("isAxiosError" in response) {
      return {
        success: false,
        error: response.message || "Failed to send email",
      }
    }

    // Check if response is successful
    if (
      Array.isArray(response) &&
      response.length > 0 &&
      response[0].status === "sent"
    ) {
      return {
        success: true,
        messageId: response[0]._id,
      }
    }

    return {
      success: false,
      error: "Failed to send email",
    }
  } catch (error) {
    console.error("Error sending transactional email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export const sendKYCNudgeEmail = async (
  userEmail: string,
  userName?: string,
): Promise<EmailResponse> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Welcome to OP Atlas!</h1>
        <p>Hi ${userName || "there"},</p>
        <p>Thank you for joining our community. We're excited to have you on board!</p>
        <p>To get started with your KYC verification, please complete the verification process.</p>
        <p>Best regards,<br>The OP Atlas Team</p>
    </div>
  `

  return sendTransactionEmail({
    to: userEmail,
    subject: "Welcome to OP Atlas - Complete Your KYC",
    html,
  })
}

export const sendKYCExpiredEmail = async (
  userEmail: string,
  userName?: string,
): Promise<EmailResponse> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #e74c3c; text-align: center;">KYC Verification Expired</h1>
        <p>Hi ${userName || "there"},</p>
        <p>Your KYC verification has expired. To continue using OP Atlas, please complete a new verification.</p>
        <p>If you need assistance, please contact our support team.</p>
        <p>Best regards,<br>The OP Atlas Team</p>
    </div>
  `

  return sendTransactionEmail({
    to: userEmail,
    subject: "KYC Verification Expired - Action Required",
    html,
  })
}

export const sendKYCCompletedEmail = async (
  userEmail: string,
  userName?: string,
): Promise<EmailResponse> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #27ae60; text-align: center;">KYC Verification Completed!</h1>
        <p>Hi ${userName || "there"},</p>
        <p>Congratulations! Your KYC verification has been completed successfully.</p>
        <p>You now have full access to all OP Atlas features.</p>
        <p>Best regards,<br>The OP Atlas Team</p>
    </div>
  `

  return sendTransactionEmail({
    to: userEmail,
    subject: "KYC Verification Completed - Welcome to OP Atlas",
    html,
  })
}

export const sendKYCStartedEmail = async (
  kycUser: KYCUser,
): Promise<EmailResponse> => {
  // Create Persona inquiry link
  const inquiryResult = await createPersonaInquiryLink(kycUser)

  // If inquiry link creation failed, return error instead of sending email
  if (!inquiryResult.success) {
    return {
      success: false,
      messageId: undefined,
    }
  }

  // Ensure we have a valid inquiry URL
  if (!inquiryResult.inquiryUrl) {
    return {
      success: false,
      messageId: undefined,
    }
  }

  const kycLink = inquiryResult.inquiryUrl

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Retro Funding: Complete KYC to Receive Your Rewards</h1>
        <p>Hi ${kycUser.firstName},</p>
        <p>Congratulations again on your Retro Funding allocation!</p>
        <p>In order to receive your OP tokens, you must complete KYC for your project.</p>
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

  return sendTransactionEmail({
    to: kycUser.email,
    subject: "Retro Funding: Complete KYC to receive your rewards.",
    html,
  })
}
