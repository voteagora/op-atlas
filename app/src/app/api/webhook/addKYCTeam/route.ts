import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { processTypeformWebhook } from "@/lib/typeform"

export interface TypeformItem {
  form_id?: string
  submitted_at?: string
  hidden: {
    kyc_team_id: string
    l2_address?: string
  }
  answers?: Array<{
    field?: {
      type?: string
      id?: string
    }
    email?: string
    text?: string
    number?: number
  }>
}

export interface WebhookPayload {
  event_id: string
  event_type: string
  form_response: TypeformItem
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw request body for signature verification
    const bodyText = await request.text()

    const body = JSON.parse(bodyText) as WebhookPayload

    // Verify the webhook signature
    const signature = request.headers.get("typeform-signature") || ""
    const signingSecret = process.env.TYPEFORM_SIGNING_SECRET || ""

    if (
      !signature ||
      !verifyWebhookSignature(signingSecret, signature, bodyText)
    ) {
      console.error("Invalid signature. Request body:", bodyText)
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Process the webhook payload
    const formEntry = await processTypeformWebhook(body)

    if (!formEntry) {
      console.error("Invalid webhook data. Request body:", bodyText)
      return NextResponse.json(
        { error: "Invalid webhook data" },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { success: true, message: "Webhook processed successfully" },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error processing webhook:", error)
    console.error("Request body:", await request.text())
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

/**
 * Verify webhook signature to ensure it's from Typeform using HMAC SHA-256
 * @param signingSecret The Typeform signing secret
 * @param signature The signature from the webhook headers
 * @param body The raw webhook body
 * @returns True if the signature is valid, false otherwise
 */
function verifyWebhookSignature(
  signingSecret: string,
  signature: string,
  body: string,
): boolean {
  // Create HMAC using the shared secret
  const hmac = crypto.createHmac("sha256", signingSecret)

  // Update HMAC with the raw body string (not parsed JSON)
  hmac.update(body)

  // Get the calculated signature in base64 format and add the 'sha256=' prefix
  const calculatedSignature = "sha256=" + hmac.digest("base64")

  // Perform a constant-time comparison between signatures (helps prevent timing attacks)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature),
      Buffer.from(signature),
    )
  } catch (error) {
    console.error("Error comparing signatures:", error)
    return false
  }
}
