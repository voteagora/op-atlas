"use server"

import { revalidatePath } from "next/cache"
import { citizenCategory, CitizenRegistrationStatus } from "@prisma/client"
import { getAddress } from "viem"

import { prisma } from "@/db/client"
import {
  countCitizenSeasons,
  findBlockedCitizenSeasonEvaluation,
} from "@/db/citizenSeasons"
import { getSeasonOrThrow } from "@/lib/seasons"
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
    const checksummedAddress = getAddress(governanceAddress)
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

    // Check citizen limit before creating attestation (attestation is on-chain and irreversible)
    const season = await getSeasonOrThrow(seasonId)
    if (season.userCitizenLimit) {
      const currentCount = await countCitizenSeasons({
        seasonId,
        type: citizenCategory.USER,
      })
      if (currentCount >= season.userCitizenLimit) {
        return {
          success: false,
          error: "Citizen registration limit has been reached for this season",
        }
      }
    }

    // Check if user already has an attestation for this season (idempotency check)
    const existingCitizenSeason = await prisma.citizenSeason.findFirst({
      where: {
        seasonId,
        userId,
        attestationId: { not: null },
        registrationStatus: CitizenRegistrationStatus.ATTESTED,
      },
    })

    if (existingCitizenSeason?.attestationId) {
      return { success: true, attestationId: existingCitizenSeason.attestationId }
    }

    // Create the attestation
    const attestationId = await createCitizenAttestation({
      to: checksummedAddress,
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

    // Use a transaction to ensure both tables are updated atomically
    await prisma.$transaction(async (tx) => {
      // Create CitizenSeason record
      await tx.citizenSeason.create({
        data: {
          seasonId,
          userId,
          governanceAddress: checksummedAddress,
          registrationStatus: CitizenRegistrationStatus.ATTESTED,
          attestationId,
          trustBreakdown: trustBreakdown || null,
        },
      })

      // Upsert to legacy Citizen table for voting system compatibility
      await tx.citizen.upsert({
        where: {
          userId,
        },
        update: {
          address: checksummedAddress,
          attestationId,
          type: CITIZEN_TYPES.user,
          projectId: null,
          organizationId: null,
        },
        create: {
          userId,
          address: checksummedAddress,
          attestationId,
          type: CITIZEN_TYPES.user,
          projectId: null,
          organizationId: null,
        },
      })
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
