import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

import {
  AuthenticationError,
  createCommonErrorHandler,
  withErrorHandler,
} from "./withErrorHandler"

export type VerificationMethod = "webhook" | "apiKey"

interface WebhookVerificationConfig {
  type: "webhook"
  signingSecret: string
  signatureHeader: string
}

interface ApiKeyVerificationConfig {
  type: "apiKey"
  authenticateApiUser: (request: NextRequest) => Promise<{
    authenticated: boolean
    failReason?: string
  }>
}

type VerificationConfig = WebhookVerificationConfig | ApiKeyVerificationConfig

/**
 * Verify webhook signature using HMAC SHA-256
 */
const verifyWebhookSignature = (
  signingSecret: string,
  signature: string,
  body: string,
): boolean => {
  const hmac = crypto.createHmac("sha256", signingSecret)
  hmac.update(body)
  const calculatedSignature = "sha256=" + hmac.digest("base64")

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

/**
 * Verify request based on the provided configuration
 */
export const verifyRequest = async <TBody>(
  request: NextRequest,
  config: VerificationConfig,
  body: string,
): Promise<void> => {
  switch (config.type) {
    case "webhook": {
      const signature = request.headers.get(config.signatureHeader) || ""
      if (!signature) {
        throw new AuthenticationError("Missing signature header")
      }

      if (!verifyWebhookSignature(config.signingSecret, signature, body)) {
        throw new AuthenticationError(
          `Invalid signature: ${signature}, body: ${body}, has secret: ${!!config.signingSecret}`,
        )
      }
      break
    }

    case "apiKey": {
      const authResponse = await config.authenticateApiUser(request)
      if (!authResponse.authenticated) {
        throw new AuthenticationError(
          authResponse.failReason || "Authentication failed",
        )
      }
      break
    }
  }
}

/**
 * Create a verification configuration for webhook signatures
 */
export const createWebhookVerification = (
  signingSecret: string,
  signatureHeader: string = "typeform-signature",
): WebhookVerificationConfig => ({
  type: "webhook",
  signingSecret,
  signatureHeader,
})

/**
 * Create a verification configuration for API key authentication
 */
export const createApiKeyVerification = (
  authenticateApiUser: (request: NextRequest) => Promise<{
    authenticated: boolean
    failReason?: string
  }>,
): ApiKeyVerificationConfig => ({
  type: "apiKey",
  authenticateApiUser,
})

/**
 * Generic handler for API routes that require API key authentication
 */
export const verifyRequestWithApiKey = (
  handler: (request: NextRequest, body: string) => Promise<NextResponse>,
  authenticateApiUser: (request: NextRequest) => Promise<{
    authenticated: boolean
    failReason?: string
  }>,
  logBody: boolean = true,
) => {
  const wrappedHandler = async (
    request: NextRequest,
    body: string,
  ): Promise<NextResponse> => {
    // Verify API key first
    const verificationConfig = createApiKeyVerification(authenticateApiUser)
    await verifyRequest(request, verificationConfig, body)

    // If verification passes, proceed with the handler
    return handler(request, body)
  }

  // Wrap with error handler
  return withErrorHandler(wrappedHandler, createCommonErrorHandler(logBody))
}
