import { NextRequest, NextResponse } from "next/server"

import {
  createWebhookVerification,
  verifyRequest,
} from "@/lib/api/requestVerification"
import {
  createCommonErrorHandler,
  ValidationError,
  withErrorHandler,
} from "@/lib/api/withErrorHandler"
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

const handleWebhook = async (
  request: NextRequest,
  body: string,
): Promise<NextResponse> => {
  // Verify the webhook signature
  const verificationConfig = createWebhookVerification(
    process.env.TYPEFORM_SIGNING_SECRET || "",
  )
  await verifyRequest(request, verificationConfig, body)

  const webhookPayload = JSON.parse(body) as WebhookPayload

  // Process the webhook payload
  const formEntry = await processTypeformWebhook(webhookPayload)

  if (!formEntry) {
    throw new ValidationError("Invalid webhook data")
  }

  return NextResponse.json(
    { success: true, message: "Webhook processed successfully" },
    { status: 200 },
  )
}

// Create a custom error handler that logs the request body
const errorHandler = createCommonErrorHandler(true)

// Export the wrapped handler
export const POST = withErrorHandler(handleWebhook, errorHandler)
