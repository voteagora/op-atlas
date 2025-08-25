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
  error?: string
}

/**
 * Send a transactional email using Mailchimp
 */
export const sendTransactionEmail = async (
  emailData: EmailData,
): Promise<EmailResponse> => {
  console.log("🚨 [sendTransactionEmail] FUNCTION CALLED - DEBUGGING ACTIVE")
  console.log("🚨 [sendTransactionEmail] Raw emailData received:", JSON.stringify(emailData, null, 2))

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined
  if (isDevelopment) {
    console.log("🔧 [sendTransactionEmail] DEVELOPMENT MODE DETECTED")
    console.log("🔧 [sendTransactionEmail] Bypassing actual email send for local development")
    console.log("🔧 [sendTransactionEmail] Would have sent email with these details:")
    console.log("   - To:", emailData.to)
    console.log("   - From:", emailData.from || "noreply@mailchimp.com")
    console.log("   - Subject:", emailData.subject)
    console.log("   - HTML Length:", emailData.html?.length || 0)

    // Simulate successful email send for development
    return { success: true }
  }

  try {
    console.log("📧 [sendTransactionEmail] Starting email send process")
    console.log("📧 [sendTransactionEmail] Email data:", {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from || "noreply@mailchimp.com",
      htmlLength: emailData.html?.length || 0,
      hasReplyTo: !!emailData.replyTo
    })

    // Use the from email passed in the function parameters
    const fromEmail = emailData.from || "noreply@mailchimp.com"
    console.log("📧 [sendTransactionEmail] Using from email:", fromEmail)
    console.log("📧 [sendTransactionEmail] From email source:", emailData.from ? "explicit" : "default")

    const message = {
      html: emailData.html,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, ""),
      subject: emailData.subject,
      from_email: fromEmail,
      to: [{ email: emailData.to, type: "to" as const }],
      ...(emailData.replyTo && { reply_to: emailData.replyTo }),
    }

    console.log("📧 [sendTransactionEmail] Mailchimp message prepared, calling API...")
    console.log("📧 [sendTransactionEmail] Final message details:", {
      to: message.to,
      subject: message.subject,
      from_email: message.from_email,
      htmlLength: message.html?.length || 0
    })
    const response = await client.messages.send({ message })
    console.log("📧 [sendTransactionEmail] Mailchimp API response:", response)

    // Check if response is an error
    if ("isAxiosError" in response) {
      console.log("❌ [sendTransactionEmail] Axios error detected:", response.message)
      return {
        success: false,
        error: response.message || "Failed to send email",
      }
    }

    // Check if response is an array (successful API call)
    if (Array.isArray(response)) {
      console.log("📧 [sendTransactionEmail] Response array length:", response.length)

      // Check each email result
      response.forEach((result: any, index: number) => {
        console.log(`📧 [sendTransactionEmail] Email ${index + 1} result:`, {
          email: result.email,
          status: result.status,
          id: result._id,
          rejectReason: result.reject_reason,
          queuedReason: result.queued_reason
        })

        if (result.status === 'rejected') {
          console.log(`❌ [sendTransactionEmail] Email rejected for ${result.email}:`)
          console.log(`   - Reject reason: ${result.reject_reason}`)
          console.log(`   - Queued reason: ${result.queued_reason}`)

          if (result.reject_reason === 'unsigned') {
            console.log("🔧 [sendTransactionEmail] UNSIGNED REJECTION - This means:")
            console.log("   1. The sending domain may not be verified with Mailchimp")
            console.log("   2. SPF/DKIM records may be missing or incorrect")
            console.log("   3. The API key may not have permission for this domain")
            console.log("   4. Check Mailchimp dashboard for domain verification status")
          }
        }
      })

      // Check if response is successful
      if (response.length > 0 && response[0].status === "sent") {
        console.log("✅ [sendTransactionEmail] Email sent successfully")
        return { success: true }
      } else if (response.length > 0 && response[0].status === "rejected") {
        const rejectReason = (response[0] as any).reject_reason || "unknown"
        console.log(`❌ [sendTransactionEmail] Email rejected: ${rejectReason}`)
        return {
          success: false,
          error: `Email rejected: ${rejectReason}`,
        }
      }
    }

    console.log("⚠️ [sendTransactionEmail] Unexpected response format:", response)
    return {
      success: false,
      error: "Failed to send email",
    }
  } catch (error) {
    console.error("❌ [sendTransactionEmail] Exception occurred:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export const sendKYCStartedEmail = async (
  kycUser: KYCUser,
): Promise<EmailResponse> => {
  console.log("🔍 [sendKYCStartedEmail] Starting email process for user:", kycUser.email)
  console.log("🔍 [sendKYCStartedEmail] User data:", {
    id: kycUser.id,
    firstName: kycUser.firstName,
    lastName: kycUser.lastName,
    email: kycUser.email,
    businessName: kycUser.businessName
  })

  const templateId = process.env.PERSONA_INQUIRY_KYC_TEMPLATE
  console.log("🔍 [sendKYCStartedEmail] Template ID from env:", templateId ? "✅ Found" : "❌ Missing")

  if (!templateId) {
    console.log("❌ [sendKYCStartedEmail] Missing PERSONA_INQUIRY_KYC_TEMPLATE environment variable")
    return {
      success: false,
      error: "Missing required Persona KYC template ID",
    }
  }

  console.log("🔍 [sendKYCStartedEmail] Calling createPersonaInquiryLink...")
  const inquiryResult = await createPersonaInquiryLink(kycUser, templateId)
  console.log("🔍 [sendKYCStartedEmail] createPersonaInquiryLink result:", inquiryResult)

  if (!inquiryResult.success) {
    console.log("❌ [sendKYCStartedEmail] createPersonaInquiryLink failed")
    return { success: false }
  }

  if (!inquiryResult.inquiryUrl) {
    console.log("❌ [sendKYCStartedEmail] No inquiry URL returned from createPersonaInquiryLink")
    return { success: false }
  }

  const kycLink = inquiryResult.inquiryUrl
  console.log("🔍 [sendKYCStartedEmail] Generated KYC link:", kycLink)

  console.log("🔍 [sendKYCStartedEmail] Generating email HTML template...")
  const html = getKYCEmailTemplate(kycUser, kycLink)
  console.log("🔍 [sendKYCStartedEmail] Email template generated, length:", html.length)

  console.log("🔍 [sendKYCStartedEmail] Calling sendTransactionEmail...")
  const emailParams = {
    to: kycUser.email,
    subject: "Retro Funding: Complete KYC to receive your rewards.",
    html,
    from: "noreply@mailchimp.com" // Force this from address for testing
  }
  console.log("🔍 [sendKYCStartedEmail] Email parameters being passed:", JSON.stringify(emailParams, null, 2))

  const emailResult = await sendTransactionEmail(emailParams)
  console.log("🔍 [sendKYCStartedEmail] sendTransactionEmail result:", emailResult)

  return emailResult
}

export const sendKYBStartedEmail = async (
  kycUser: KYCUser,
): Promise<EmailResponse> => {
  console.log("🔍 [sendKYBStartedEmail] Starting email process for user:", kycUser.email)
  console.log("🔍 [sendKYBStartedEmail] User data:", {
    id: kycUser.id,
    firstName: kycUser.firstName,
    lastName: kycUser.lastName,
    email: kycUser.email,
    businessName: kycUser.businessName
  })

  const templateId = process.env.PERSONA_INQUIRY_KYB_TEMPLATE
  console.log("🔍 [sendKYBStartedEmail] Template ID from env:", templateId ? "✅ Found" : "❌ Missing")

  if (!templateId) {
    console.log("❌ [sendKYBStartedEmail] Missing PERSONA_INQUIRY_KYB_TEMPLATE environment variable")
    return {
      success: false,
      error: "Missing required Persona KYB template ID",
    }
  }

  console.log("🔍 [sendKYBStartedEmail] Calling createPersonaInquiryLink...")
  const inquiryResult = await createPersonaInquiryLink(kycUser, templateId)
  console.log("🔍 [sendKYBStartedEmail] createPersonaInquiryLink result:", inquiryResult)

  if (!inquiryResult.success) {
    console.log("❌ [sendKYBStartedEmail] createPersonaInquiryLink failed")
    return { success: false }
  }

  if (!inquiryResult.inquiryUrl) {
    console.log("❌ [sendKYBStartedEmail] No inquiry URL returned from createPersonaInquiryLink")
    return { success: false }
  }

  const kycLink = inquiryResult.inquiryUrl
  console.log("🔍 [sendKYBStartedEmail] Generated KYB link:", kycLink)

  console.log("🔍 [sendKYBStartedEmail] Generating email HTML template...")
  const html = getKYBEmailTemplate(kycUser, kycLink)
  console.log("🔍 [sendKYBStartedEmail] Email template generated, length:", html.length)

  console.log("🔍 [sendKYBStartedEmail] Calling sendTransactionEmail...")
  const emailResult = await sendTransactionEmail({
    to: kycUser.email,
    subject: "Retro Funding: Complete KYB to receive your rewards.",
    html,
  })
  console.log("🔍 [sendKYBStartedEmail] sendTransactionEmail result:", emailResult)

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
