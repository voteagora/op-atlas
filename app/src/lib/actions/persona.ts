"use server"

import { KYCLegalEntity, KYCUser } from "@prisma/client"
import { randomBytes } from "crypto"

import { prisma } from "@/db/client"

export interface PersonaInquiryLinkResponse {
  success: boolean
  inquiryId?: string
  inquiryUrl?: string
  referenceId?: string
  error?: string
}

const PERSONA_VERIFICATION_URL = "https://inquiry.withpersona.com/verify"
const PERSONA_API_URL = "https://api.withpersona.com"
const PERSONA_API_KEY = process.env.PERSONA_API_KEY

type PersonaEntity =
  | { type: "kycUser"; entity: KYCUser }
  | { type: "legalEntity"; entity: KYCLegalEntity }

export const createPersonaInquiryLink = async (
  input:
    | PersonaEntity
    | { templateId?: string; referenceId?: string },
  templateIdOverride?: string,
): Promise<PersonaInquiryLinkResponse> => {
  try {
    const defaultKYBTemplateId = process.env.PERSONA_INQUIRY_KYB_TEMPLATE
    const defaultKYCTemplateId = process.env.PERSONA_INQUIRY_KYC_TEMPLATE

    let templateId: string | undefined
    let referenceId: string | undefined

    if ("type" in (input as any) && "entity" in (input as any)) {
      // Backward-compatible path using a KYC/KYB entity
      const { type, entity } = input as PersonaEntity
      // Prefer explicit override if provided; otherwise pick sensible default per entity type
      templateId = templateIdOverride ?? (type === "kycUser" ? defaultKYCTemplateId : defaultKYBTemplateId)
      referenceId = entity.personaReferenceId ?? undefined

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
    } else {
      // Simple path using provided template/reference
      const simple = input as { templateId?: string; referenceId?: string }
      // For simple path, prefer explicit override, then provided templateId, then fall back to KYB default (historic behavior)
      templateId = templateIdOverride ?? simple.templateId ?? defaultKYBTemplateId
      referenceId = simple.referenceId

      if (!referenceId) {
        referenceId = randomBytes(16).toString("hex")
      }
    }

    if (!templateId) {
      return {
        success: false,
        error: "Persona template ID not configured",
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

export const createPersonaInquiry = async ({
  templateId,
  referenceId,
}: {
  templateId?: string
  referenceId?: string
}): Promise<{ success: boolean; inquiryId?: string; referenceId?: string; error?: string }> => {
  try {
    const resolvedTemplateId = templateId ?? process.env.PERSONA_INQUIRY_KYB_TEMPLATE
    if (!PERSONA_API_KEY) {
      return { success: false, error: "Persona API key not configured" }
    }
    if (!resolvedTemplateId) {
      return { success: false, error: "Persona template ID not configured" }
    }

    let refId = referenceId ?? randomBytes(16).toString("hex")

    const payload = {
      data: {
        type: "inquiry",
        attributes: {
          "inquiry-template-id": resolvedTemplateId,
          "reference-id": refId,
        },
      },
    }

    const response = await fetch(`${PERSONA_API_URL}/api/v1/inquiries`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERSONA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any))
      const errorMessage =
        (errorData as any).errors?.[0]?.detail ||
        (errorData as any).errors?.[0]?.title ||
        (errorData as any).error ||
        (errorData as any).message ||
        (errorData as any).detail ||
        "Unknown error"
      return {
        success: false,
        error: `Failed to create Persona inquiry: ${response.status} ${response.statusText} - ${errorMessage}`,
      }
    }

    const data = await response.json()
    const inquiryId = data?.data?.id as string | undefined
    return { success: true, inquiryId, referenceId: refId }
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

export const generatePersonaOneTimeLink = async (
  inquiryId: string,
): Promise<PersonaInquiryLinkResponse> => {
  try {
    const PERSONA_API_KEY = process.env.PERSONA_API_KEY
    if (!PERSONA_API_KEY) {
      return {
        success: false,
        error: "Persona API key not configured",
      }
    }

    if (!inquiryId) {
      return { success: false, error: "Missing inquiryId" }
    }

    const linkResponse = await fetch(
      `${PERSONA_API_URL}/api/v1/inquiries/${inquiryId}/generate-one-time-link`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PERSONA_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({}),
      },
    )

    if (!linkResponse.ok) {
      const errorData = await linkResponse.json().catch(() => ({}))
      const errorMessage =
        errorData.errors?.[0]?.detail ||
        errorData.errors?.[0]?.title ||
        errorData.error ||
        errorData.message ||
        errorData.detail ||
        "Unknown error"
      return {
        success: false,
        error: `Failed to generate one-time link: ${linkResponse.status} ${linkResponse.statusText} - ${errorMessage}`,
      }
    }

    const linkData = await linkResponse.json()
    const inquiryUrl = linkData?.meta?.["one-time-link"] as string | undefined

    if (!inquiryUrl) {
      return { success: false, error: "Invalid response from Persona API" }
    }

    return { success: true, inquiryId, inquiryUrl }
  } catch (error) {
    console.error("Error generating Persona one-time link:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
