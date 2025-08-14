"use server"

import mailchimp from "@mailchimp/mailchimp_transactional"

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
            from_email:
                emailData.from ||
                process.env.DEFAULT_FROM_EMAIL ||
                "noreply@example.com",
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
    <h1>Welcome to OP Atlas!</h1>
    <p>Hi ${userName || "there"},</p>
    <p>Thank you for joining our community. We're excited to have you on board!</p>
    <p>Best regards,<br>The OP Atlas Team</p>
  `

    return sendTransactionEmail({
        to: userEmail,
        subject: "Welcome to OP Atlas",
        html,
    })
}

export const sendKYCExpiredEmail = async (
    userEmail: string,
    userName?: string,
): Promise<EmailResponse> => {
    const html = `
    <h1>Welcome to OP Atlas!</h1>
    <p>Hi ${userName || "there"},</p>
    <p>Thank you for joining our community. We're excited to have you on board!</p>
    <p>Best regards,<br>The OP Atlas Team</p>
  `

    return sendTransactionEmail({
        to: userEmail,
        subject: "Welcome to OP Atlas",
        html,
    })
}

export const sendKYCCompletedEmail = async (
    userEmail: string,
    userName?: string,
): Promise<EmailResponse> => {
    const html = `
    <h1>Welcome to OP Atlas!</h1>
    <p>Hi ${userName || "there"},</p>
    <p>Thank you for joining our community. We're excited to have you on board!</p>
    <p>Best regards,<br>The OP Atlas Team</p>
  `

    return sendTransactionEmail({
        to: userEmail,
        subject: "Welcome to OP Atlas",
        html,
    })
}

export const sendKYCStartedEmail = async (
    userEmail: string,
    userName?: string,
): Promise<EmailResponse> => {
    const html = `
    <h1>Welcome to OP Atlas!</h1>
    <p>Hi ${userName || "there"},</p>
    <p>Thank you for joining our community. We're excited to have you on board!</p>
    <p>Best regards,<br>The OP Atlas Team</p>
  `

    return sendTransactionEmail({
        to: userEmail,
        subject: "Welcome to OP Atlas",
        html,
    })
}
