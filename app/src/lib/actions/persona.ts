"use server"

import { randomBytes } from "crypto"

import { KYCUser, KYCLegalEntity } from "@prisma/client"

import { withSessionDb } from "@/lib/db/sessionContext"
import { withImpersonationProtection } from "@/lib/impersonationContext"

export interface PersonaInquiryLinkResponse {
  success: boolean
  inquiryId?: string
  inquiryUrl?: string
  referenceId?: string
  error?: string
  mocked?: boolean
}

const PERSONA_VERIFICATION_URL =
  "https://inquiry.withpersona.com/verify"

type PersonaEntity =
  | { type: 'kycUser', entity: KYCUser }
  | { type: 'legalEntity', entity: KYCLegalEntity }

export const createPersonaInquiryLink = async (
  personaEntity: PersonaEntity,
  templateId: string,
): Promise<PersonaInquiryLinkResponse> => {
  return withSessionDb(async ({ db }) => {
    const mockReferenceId = `${personaEntity.entity.id}-impersonation`
    const mockSearchParams = new URLSearchParams({
      "reference-id": mockReferenceId,
      "mocked": "true",
    })
    return withImpersonationProtection(
      "Persona",
      `Create inquiry link for ${personaEntity.type}`,
      async (): Promise<PersonaInquiryLinkResponse> => {
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
              const updatedUser = await db.kYCUser.update({
                where: { id: entity.id },
                data: { personaReferenceId: newReferenceId },
                select: { personaReferenceId: true },
              })
              referenceId = updatedUser.personaReferenceId ?? newReferenceId
            } else {
              const updatedEntity = await db.kYCLegalEntity.update({
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
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          }
        }
      },
      {
        success: true,
        inquiryUrl: `${PERSONA_VERIFICATION_URL}?${mockSearchParams.toString()}`,
        referenceId: mockReferenceId,
        mocked: true,
      },
    )
  })
}
