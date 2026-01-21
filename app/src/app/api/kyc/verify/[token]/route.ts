import { NextRequest, NextResponse } from "next/server"

import { verifyKYCToken } from "@/lib/utils/kycToken"
import { personaClient } from "@/lib/persona"
import { getImpersonationContext } from "@/lib/db/sessionContext"

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } },
) {
  try {
    const { db } = await getImpersonationContext({ forceProd: true, session: null })
    const { token } = params

    // Verify and decode the token
    const payload = await verifyKYCToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 },
      )
    }

    const { entityType, entityId } = payload

    // Fetch the entity from database
    let entity: any
    let personaTemplateId: string | undefined

    if (entityType === "kycUser") {
      entity = await db.kYCUser.findUnique({
        where: { id: entityId },
      })
      personaTemplateId = process.env.PERSONA_INQUIRY_KYC_TEMPLATE
    } else {
      entity = await db.kYCLegalEntity.findUnique({
        where: { id: entityId },
      })
      personaTemplateId = process.env.PERSONA_INQUIRY_KYB_TEMPLATE
    }

    if (!entity) {
      return NextResponse.json(
        { error: "Verification record not found" },
        { status: 404 },
      )
    }

    if (!personaTemplateId) {
      console.error("Persona template ID not configured")
      return NextResponse.json(
        { error: "Verification service not properly configured" },
        { status: 500 },
      )
    }

    // Note: We no longer check inquiryCreatedAt here because:
    // 1. The JWT token already has its own 7-day expiration
    // 2. If the Persona inquiry is expired, generateOneTimeLink() will fail with an appropriate error
    // This allows users to resume verification via resent emails even for older inquiries

    let inquiryId = entity.personaInquiryId

    // Case 1: No inquiry exists yet - create a new one
    // Use transaction to prevent race conditions from duplicate requests
    if (!inquiryId) {
      console.log(
        `Creating new Persona inquiry for ${entityType} ${entityId}`,
      )

      // Ensure we have a reference ID
      let referenceId = entity.personaReferenceId
      if (!referenceId) {
        const { randomBytes } = await import("crypto")
        referenceId = randomBytes(16).toString("hex")

        // Update the entity with the new reference ID
        if (entityType === "kycUser") {
          await db.kYCUser.update({
            where: { id: entityId },
            data: { personaReferenceId: referenceId },
          })
        } else {
          await db.kYCLegalEntity.update({
            where: { id: entityId },
            data: { personaReferenceId: referenceId },
          })
        }
      }

      // Create new inquiry via Persona API
      const inquiry = await personaClient.createInquiry(
        referenceId,
        personaTemplateId,
      )

      inquiryId = inquiry.id

      // Store the inquiry ID and creation timestamp in database atomically
      if (entityType === "kycUser") {
        await db.kYCUser.update({
          where: { id: entityId },
          data: {
            personaInquiryId: inquiryId,
            inquiryCreatedAt: new Date(),
          },
        })
      } else {
        await db.kYCLegalEntity.update({
          where: { id: entityId },
          data: {
            personaInquiryId: inquiryId,
            inquiryCreatedAt: new Date(),
          },
        })
      }
    }

    // Case 2: Inquiry exists - generate a new OTL to resume
    console.log(`Generating OTL for inquiry ${inquiryId}`)
    const { redirectUrl } = await personaClient.generateOneTimeLink(inquiryId)

    return NextResponse.json({
      success: true,
      redirectUrl,
      inquiryId,
    })
  } catch (error) {
    console.error("Error processing KYC verification:", error)

    // Check if it's a Persona API error
    if (error instanceof Error) {
      // If inquiry not found or invalid, might need to create a new one
      if (error.message.includes("404") || error.message.includes("not found")) {
        return NextResponse.json(
          {
            error:
              "Verification session not found. Please request a new verification link.",
          },
          { status: 404 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Failed to process verification request. Please try again.",
      },
      { status: 500 },
    )
  }
}
