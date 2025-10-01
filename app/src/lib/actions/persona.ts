"use server"

import { randomBytes } from "crypto"

import { KYCUser } from "@prisma/client"

import { prisma } from "@/db/client"

export interface PersonaInquiryLinkResponse {
  success: boolean
  inquiryId?: string
  inquiryUrl?: string
  error?: string
}

const PERSONA_VERIFICATION_URL =
  "https://inquiry.withpersona.com/verify"

export const createPersonaInquiryLink = async (
  kycUser: KYCUser,
  templateId: string,
): Promise<PersonaInquiryLinkResponse> => {
  try {
    if (!templateId) {
      return {
        success: false,
        error: "Persona template ID not configured",
      }
    }
    let referenceId = kycUser.personaReferenceId ?? undefined

    if (!referenceId) {
      const newReferenceId = randomBytes(16).toString("hex")

      const updatedUser = await prisma.kYCUser.update({
        where: { id: kycUser.id },
        data: { personaReferenceId: newReferenceId },
        select: { personaReferenceId: true },
      })

      referenceId = updatedUser.personaReferenceId ?? newReferenceId
    }

    if (!referenceId) {
      throw new Error("Failed to determine Persona reference ID")
    }

    const searchParams = new URLSearchParams({
      "inquiry-template-id": templateId,
      reference_id: referenceId,
    })

    return {
      success: true,
      inquiryUrl: `${PERSONA_VERIFICATION_URL}?${searchParams.toString()}`,
    }
  } catch (error) {
    console.error("Error creating Persona inquiry:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
