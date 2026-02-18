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
        include: { kycLegalEntityController: true },
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

    let inquiryId = entity.personaInquiryId
    let referenceId = entity.personaReferenceId
    let needsNewInquiry = !inquiryId

    if (inquiryId) {
      const existingInquiry = await personaClient.getInquiryById(inquiryId)
      if (!existingInquiry) {
        console.log(
          `Persona inquiry ${inquiryId} not found, will create a new one`,
        )
        needsNewInquiry = true
      } else if (existingInquiry.attributes.status === "expired") {
        console.log(
          `Persona inquiry ${inquiryId} is expired, will create a new one`,
        )
        needsNewInquiry = true
      }
    }

    if (needsNewInquiry) {
      console.log(
        `Creating new Persona inquiry for ${entityType} ${entityId}`,
      )

      if (!referenceId) {
        const { randomBytes } = await import("crypto")
        referenceId = randomBytes(16).toString("hex")
        console.log(
          `Generated new Persona reference ID for ${entityType} ${entityId}`,
        )
      } else {
        console.log(
          `Reusing existing Persona reference ID for ${entityType} ${entityId}`,
        )
      }

      const fields: Record<string, string> = {}
      if (entityType === "legalEntity") {
        if (entity.name) fields["business-name"] = entity.name
        const controller = entity.kycLegalEntityController
        if (controller) {
          if (controller.firstName) fields["control-person-name-first"] = controller.firstName
          if (controller.lastName) fields["control-person-name-last"] = controller.lastName
          if (controller.email) fields["control-person-email-address"] = controller.email
        }
      }

      const inquiry = await personaClient.createInquiry(
        referenceId,
        personaTemplateId,
        Object.keys(fields).length > 0 ? fields : undefined,
      )

      inquiryId = inquiry.id

      if (entityType === "kycUser") {
        await db.kYCUser.update({
          where: { id: entityId },
          data: {
            personaReferenceId: referenceId,
            personaInquiryId: inquiryId,
            inquiryCreatedAt: new Date(),
          },
        })
      } else {
        await db.kYCLegalEntity.update({
          where: { id: entityId },
          data: {
            personaReferenceId: referenceId,
            personaInquiryId: inquiryId,
            inquiryCreatedAt: new Date(),
          },
        })
      }
    }

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
