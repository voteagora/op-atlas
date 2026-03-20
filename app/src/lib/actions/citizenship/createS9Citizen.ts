"use server"

import { citizenCategory, CitizenRegistrationStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { getAddress } from "viem"

import {
  countCitizenSeasons,
  findBlockedCitizenSeasonEvaluation,
} from "@/db/citizenSeasons"
import { prisma } from "@/db/client"
import { getUserById } from "@/db/users"
import { updateMailchimpTags } from "@/lib/api/mailchimp"
import {
  CITIZEN_ATTESTATION_CODE,
  CITIZEN_TYPES,
  S9_CITIZEN_TAGS,
} from "@/lib/constants"
import { extractFailedEasTxContext } from "@/lib/eas/txContext"
import { createCitizenAttestationWithTx } from "@/lib/eas/serverOnly"
import { getMiradorChainNameFromChainId } from "@/lib/mirador/chains"
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace"
import { MiradorTraceContext } from "@/lib/mirador/types"
import { getSeasonOrThrow } from "@/lib/seasons"

export async function createS9Citizen({
  userId,
  governanceAddress,
  seasonId,
  trustBreakdown,
  traceContext,
}: {
  userId: string
  governanceAddress: string
  seasonId: string
  trustBreakdown?: any
  traceContext?: MiradorTraceContext
}): Promise<{ success: boolean; attestationId?: string; error?: string }> {
  await appendServerTraceEvent({
    traceContext: {
      ...traceContext,
      source: "backend",
      step: "citizen_attestation_start",
      userId,
      walletAddress: governanceAddress,
    },
    eventName: "citizen_attestation_started",
    details: { seasonId },
    tags: ["citizen", "attestation", "server"],
  })

  try {
    const checksummedAddress = getAddress(governanceAddress)
    const user = await getUserById(userId)
    if (!user) {
      await appendServerTraceEvent({
        traceContext: {
          ...traceContext,
          source: "backend",
          step: "citizen_attestation_user_not_found",
          userId,
        },
        eventName: "citizen_attestation_failed",
        details: { reason: "user_not_found", seasonId },
        tags: ["citizen", "attestation", "server", "error"],
      })
      return { success: false, error: "User not found" }
    }

    const blockedEvaluation = await findBlockedCitizenSeasonEvaluation({
      userId,
      seasonId,
    })

    if (blockedEvaluation) {
      await appendServerTraceEvent({
        traceContext: {
          ...traceContext,
          source: "backend",
          step: "citizen_attestation_blocked",
          userId,
          walletAddress: checksummedAddress,
        },
        eventName: "citizen_attestation_failed",
        details: { reason: "blocked_from_season", seasonId },
        tags: ["citizen", "attestation", "server", "error"],
      })
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
        await appendServerTraceEvent({
          traceContext: {
            ...traceContext,
            source: "backend",
            step: "citizen_attestation_limit_reached",
            userId,
            walletAddress: checksummedAddress,
          },
          eventName: "citizen_attestation_failed",
          details: {
            reason: "registration_limit_reached",
            seasonId,
            currentCount,
            userCitizenLimit: season.userCitizenLimit,
          },
          tags: ["citizen", "attestation", "server", "error"],
        })
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
      await appendServerTraceEvent({
        traceContext: {
          ...traceContext,
          source: "backend",
          step: "citizen_attestation_already_exists",
          userId,
          walletAddress: checksummedAddress,
        },
        eventName: "citizen_attestation_succeeded",
        details: {
          seasonId,
          existingAttestationId: existingCitizenSeason.attestationId,
          idempotent: true,
        },
        tags: ["citizen", "attestation", "server"],
      })
      return {
        success: true,
        attestationId: existingCitizenSeason.attestationId,
      }
    }

    // Create the attestation
    const { attestationId, txHash, chainId, txInputData } =
      await createCitizenAttestationWithTx({
        to: checksummedAddress,
        farcasterId: parseInt(user.farcasterId || "0"),
        selectionMethod: CITIZEN_ATTESTATION_CODE[CITIZEN_TYPES.user],
        refUID: undefined, // Users don't need refUID
      })
    const miradorChain = getMiradorChainNameFromChainId(chainId)

    // Validate attestation ID format
    const isValidAttestationId = /^0x[a-fA-F0-9]{64}$/.test(attestationId)
    if (!isValidAttestationId) {
      await appendServerTraceEvent({
        traceContext: {
          ...traceContext,
          source: "backend",
          step: "citizen_attestation_invalid_uid",
          userId,
          walletAddress: checksummedAddress,
        },
        eventName: "citizen_attestation_failed",
        details: {
          reason: "invalid_attestation_id_format",
          seasonId,
          attestationId,
        },
        tags: ["citizen", "attestation", "server", "error"],
      })
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

    await appendServerTraceEvent({
      traceContext: {
        ...traceContext,
        source: "backend",
        step: "citizen_attestation_success",
        userId,
        walletAddress: checksummedAddress,
      },
      eventName: "citizen_attestation_succeeded",
      details: {
        seasonId,
        attestationId,
        txHash,
      },
      tags: ["citizen", "attestation", "server"],
      txHashHints:
        txHash && miradorChain
          ? [
              {
                txHash,
                chain: miradorChain,
                details: "S9 citizen attestation transaction",
              },
            ]
          : undefined,
      txInputData,
    })

    return { success: true, attestationId }
  } catch (error) {
    console.error("Error creating S9 citizen:", error)
    const failedTxContext = extractFailedEasTxContext(error)
    const failedMiradorChain = failedTxContext.chainId
      ? getMiradorChainNameFromChainId(failedTxContext.chainId)
      : undefined

    await appendServerTraceEvent({
      traceContext: {
        ...traceContext,
        source: "backend",
        step: "citizen_attestation_exception",
        userId,
        walletAddress: governanceAddress,
      },
      eventName: "citizen_attestation_failed",
      details: {
        seasonId,
        error: error instanceof Error ? error.message : String(error),
      },
      tags: ["citizen", "attestation", "server", "error"],
      txHashHints:
        failedTxContext.txHash && failedMiradorChain
          ? [
              {
                txHash: failedTxContext.txHash,
                chain: failedMiradorChain,
                details: "Failed S9 citizen attestation transaction",
              },
            ]
          : undefined,
      txInputData: failedTxContext.txInputData,
    })

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create citizen",
    }
  }
}
