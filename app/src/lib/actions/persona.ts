"use server"

import { KYCUser } from "@prisma/client"

export interface PersonaInquiryLinkResponse {
  success: boolean
  inquiryId?: string
  inquiryUrl?: string
  error?: string
}

const PERSONA_API_URL = "https://api.withpersona.com"

export const createPersonaInquiryLink = async (
  kycUser: KYCUser,
  templateId: string,
): Promise<PersonaInquiryLinkResponse> => {
  try {
    const PERSONA_API_KEY = process.env.PERSONA_API_KEY

    if (!PERSONA_API_KEY) {
      return {
        success: false,
        error: "Persona API key not configured",
      }
    }

    if (!templateId) {
      return {
        success: false,
        error: "Persona template ID not configured",
      }
    }

    // Create inquiry payload
    const inquiryPayload = {
      data: {
        type: "inquiry",
        attributes: {
          "inquiry-template-id": templateId,
          "reference-id": kycUser.id,
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
      body: JSON.stringify(inquiryPayload),
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
        error: `Failed to create Persona inquiry: ${response.status} ${response.statusText} - ${errorMessage}`,
      }
    }

    const inquiryData = await response.json()

    if (inquiryData.data?.id) {
      // Generate one-time link for the inquiry
      const linkResponse = await fetch(
        `${PERSONA_API_URL}/api/v1/inquiries/${inquiryData.data.id}/generate-one-time-link`,
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
        return {
          success: false,
          error: `Failed to generate one-time link: ${linkResponse.status} ${linkResponse.statusText}`,
        }
      }

      const linkData = await linkResponse.json()

      return {
        success: true,
        inquiryId: inquiryData.data.id,
        inquiryUrl: linkData.meta?.["one-time-link"],
      }
    }

    return {
      success: false,
      error: "Invalid response from Persona API",
    }
  } catch (error) {
    console.error("Error creating Persona inquiry:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
