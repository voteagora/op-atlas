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
export const verifyRequest = async (
  request: NextRequest,
  config: VerificationConfig,
): Promise<void> => {
  switch (config.type) {
    case "webhook": {
      const signature = request.headers.get(config.signatureHeader) || ""
      if (!signature) {
        throw new AuthenticationError("Missing signature header")
      }

      const clonedRequest = request.clone()
      const bodyText = await clonedRequest.text()
      if (!verifyWebhookSignature(config.signingSecret, signature, bodyText)) {
        throw new AuthenticationError("Invalid signature")
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
 * @param handler The route handler function
 * @param authenticateApiUser The authentication function
 * @returns A wrapped handler with API key verification and error handling
 */
export const verifyRequestWithApiKey = <T>(
  handler: (request: NextRequest, body: unknown) => Promise<NextResponse>,
  authenticateApiUser: (request: NextRequest) => Promise<{
    authenticated: boolean
    failReason?: string
  }>,
  logBody: boolean = true,
) => {
  const wrappedHandler = async (
    request: NextRequest,
    body: unknown,
  ): Promise<NextResponse> => {
    // Verify API key first
    const verificationConfig = createApiKeyVerification(authenticateApiUser)
    await verifyRequest(request, verificationConfig)

    // If verification passes, proceed with the handler
    return handler(request, body)
  }

  // Wrap with error handler
  return withErrorHandler(wrappedHandler, createCommonErrorHandler(logBody))
}
