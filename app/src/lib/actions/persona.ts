"use server"

import { KYCUser } from "@prisma/client"

export interface PersonaInquiryLinkResponse {
  success: boolean
  inquiryId?: string
  inquiryUrl?: string
  error?: string
}

/**
 * Create a Persona KYC inquiry and return a one-time link
 */
export const createPersonaInquiryLink = async (
  kycUser: KYCUser,
): Promise<PersonaInquiryLinkResponse> => {
  try {
    const PERSONA_API_URL = "https://app.withpersona.com"
    const PERSONA_API_KEY = process.env.PERSONA_API_KEY
    const PERSONA_TEMPLATE_ID = process.env.PERSONA_TEMPLATE_ID

    if (!PERSONA_API_KEY) {
      return {
        success: false,
        error: "Persona API key not configured",
      }
    }

    if (!PERSONA_TEMPLATE_ID) {
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
          "template-id": PERSONA_TEMPLATE_ID,
          "reference-id": kycUser.id,
          "name-first": kycUser.firstName,
          "name-last": kycUser.lastName,
          "email-address": kycUser.email,
          "expires-at": new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 7 days from now
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
        `${PERSONA_API_URL}/api/v1/inquiries/${inquiryData.data.id}/one-time-link`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERSONA_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            data: {
              type: "one-time-link",
              attributes: {
                expires_at: new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000,
                ).toISOString(), // 7 days from now
              },
            },
          }),
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
        inquiryUrl: linkData.data?.attributes?.url,
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
