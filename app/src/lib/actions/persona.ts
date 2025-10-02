"use server"

import { randomBytes } from "crypto"

import { KYCUser, KYCLegalEntity } from "@prisma/client"

import { prisma } from "@/db/client"

export interface PersonaInquiryLinkResponse {
  success: boolean
  inquiryId?: string
  inquiryUrl?: string
  referenceId?: string
  error?: string
}

const PERSONA_VERIFICATION_URL = "https://inquiry.withpersona.com/verify"

type PersonaEntity =
  | { type: "kycUser"; entity: KYCUser }
  | { type: "legalEntity"; entity: KYCLegalEntity }

export const createPersonaInquiryLink = async (
  personaEntity: PersonaEntity,
  templateId: string,
): Promise<PersonaInquiryLinkResponse> => {
  try {
    if (!templateId) {
      return {
        success: false,
        error: "Persona template ID not configured",
      }
    }

    const { type, entity } = personaEntity
    let referenceId = entity.personaReferenceId ?? undefined

    if (!referenceId) {
      const newReferenceId = randomBytes(16).toString("hex")

      if (type === "kycUser") {
        const updatedUser = await prisma.kYCUser.update({
          where: { id: entity.id },
          data: { personaReferenceId: newReferenceId },
          select: { personaReferenceId: true },
        })
        referenceId = updatedUser.personaReferenceId ?? newReferenceId
      } else {
        const updatedEntity = await prisma.kYCLegalEntity.update({
          where: { id: entity.id },
          data: { personaReferenceId: newReferenceId },
          select: { personaReferenceId: true },
        })
        referenceId = updatedEntity.personaReferenceId ?? newReferenceId
      }
    }

    if (!referenceId) {
      throw new Error("Failed to determine Persona reference ID")
    }

    const searchParams = new URLSearchParams({
      "inquiry-template-id": templateId,
      "reference-id": referenceId,
    })

    return {
      success: true,
      inquiryUrl: `${PERSONA_VERIFICATION_URL}?${searchParams.toString()}`,
      referenceId,
    }
  } catch (error) {
    console.error("Error creating Persona inquiry:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export const createPersonaCase = async ({ pocEmail }: { pocEmail: string }) => {
  try {
    const PERSONA_API_KEY = process.env.PERSONA_API_KEY
    const PERSONA_INQUIRY_KYB_TEMPLATE =
      process.env.PERSONA_INQUIRY_KYB_TEMPLATE

    if (!PERSONA_API_KEY) {
      return {
        success: false,
        error: "Persona API key not configured",
      }
    }

    if (!PERSONA_INQUIRY_KYB_TEMPLATE) {
      return {
        success: false,
        error: "Persona template ID not configured",
      }
    }

    // Create case payload
    const casePayload = {
      data: {
        type: "inquiry",
        attributes: {
          "case-template-id": PERSONA_INQUIRY_KYB_TEMPLATE,
          "creator-email-address": pocEmail,
        },
      },
    }

    const response = await fetch(`${PERSONA_API_URL}/api/v1/cases`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERSONA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(casePayload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(
        "Persona API Error Response:",
        JSON.stringify(errorData, null, 2),
      )

      const errorMessage =
        errorData.errors?.[0]?.detail ||
        errorData.errors?.[0]?.title ||
        errorData.error ||
        errorData.message ||
        errorData.detail ||
        "Unknown error"

      return {
        success: false,
        error: `Failed to create Persona case: ${response.status} ${response.statusText} - ${errorMessage}`,
      }
    }
    const caseData = await response.json()

    return {
      success: true,
      caseId: caseData.data?.id,
    }
  } catch (error) {
    console.error("Error creating Persona case:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export const attachInquiryToCase = async ({
  inquiryId,
  caseId,
}: {
  inquiryId: string
  caseId: string
}) => {
  try {
    const PERSONA_API_KEY = process.env.PERSONA_API_KEY

    if (!PERSONA_API_KEY) {
      return {
        success: false,
        error: "Persona API key not configured",
      }
    }

    const inquiryCasePayload = {
      data: {
        type: "case",
        relationships: {
          inquiry: {
            data: {
              type: "inquiry",
              id: inquiryId,
            },
          },
        },
      },
    }

    const response = await fetch(
      `${PERSONA_API_URL}/api/v1/cases/${caseId}/add-objects`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PERSONA_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(inquiryCasePayload),
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(
        "Persona API Error Response:",
        JSON.stringify(errorData, null, 2),
      )

      const errorMessage =
        errorData.errors?.[0]?.detail ||
        errorData.errors?.[0]?.title ||
        errorData.error ||
        errorData.message ||
        errorData.detail ||
        "Unknown error"

      return {
        success: false,
        error: `Failed to attach Persona inquiry to case: ${response.status} ${response.statusText} - ${errorMessage}`,
      }
    }
    const caseData = await response.json()

    return {
      success: true,
      caseId: caseData.data?.id,
    }
  } catch (error) {
    console.error("Error attaching Persona inquiry to case:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
