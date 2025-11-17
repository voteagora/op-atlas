"use server"

import { revalidatePath } from "next/cache"
import { CitizenRegistrationStatus } from "@prisma/client"

import { prisma } from "@/db/client"
import { findBlockedCitizenSeasonEvaluation } from "@/db/citizenSeasons"
import { getUserById } from "@/db/users"
import { updateMailchimpTags } from "@/lib/api/mailchimp"
import {
  CITIZEN_ATTESTATION_CODE,
  CITIZEN_TYPES,
  S9_CITIZEN_TAGS,
} from "@/lib/constants"
import { createCitizenAttestation } from "@/lib/eas/serverOnly"

export async function createS9Citizen({
  userId,
  governanceAddress,
  seasonId,
  trustBreakdown,
}: {
  userId: string
  governanceAddress: string
  seasonId: string
  trustBreakdown?: any
}): Promise<{ success: boolean; attestationId?: string; error?: string }> {
  try {
    const user = await getUserById(userId)
    if (!user) {
      return { success: false, error: "User not found" }
    }

    const blockedEvaluation = await findBlockedCitizenSeasonEvaluation({
      userId,
      seasonId,
    })

    if (blockedEvaluation) {
      return {
        success: false,
        error: "User is blocked from registering for this season",
      }
    }

    // Create the attestation
    const attestationId = await createCitizenAttestation({
      to: governanceAddress,
      farcasterId: parseInt(user.farcasterId || "0"),
      selectionMethod: CITIZEN_ATTESTATION_CODE[CITIZEN_TYPES.user],
      refUID: undefined, // Users don't need refUID
    })

    // Validate attestation ID format
    const isValidAttestationId = /^0x[a-fA-F0-9]{64}$/.test(attestationId)
    if (!isValidAttestationId) {
      return {
        success: false,
        error: "Invalid attestation ID format",
      }
    }

    // Create CitizenSeason record
    await prisma.citizenSeason.create({
      data: {
        seasonId,
        userId,
        governanceAddress,
        registrationStatus: CitizenRegistrationStatus.ATTESTED,
        attestationId,
        trustBreakdown: trustBreakdown || null,
      },
    })

    // Update Mailchimp tags if user has an email
    const userEmail = user.emails?.[0]?.email
    if (userEmail) {
      try {
        await updateMailchimpTags([
          {
            email: userEmail,
            tags: [S9_CITIZEN_TAGS[CITIZEN_TYPES.user]],
          },
        ])
      } catch (error) {
        console.error("Failed to update Mailchimp tags:", error)
        // Continue even if Mailchimp fails - don't block registration
      }
    }

    // Invalidate citizenship page cache so user sees updated state
    revalidatePath("/citizenship")

    return { success: true, attestationId }
  } catch (error) {
    console.error("Error creating S9 citizen:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create citizen",
    }
  }
}
