"use server"

import { revalidatePath } from "next/cache"
import { CitizenRegistrationStatus } from "@prisma/client"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { isUserAdminOfOrganization } from "@/db/organizations"
import { getUserById } from "@/db/users"
import { removeMailchimpTags } from "@/lib/api/mailchimp"
import { getMiradorChainNameFromChainId } from "@/lib/mirador/chains"
import { CITIZEN_TYPES, S9_CITIZEN_TAGS } from "@/lib/constants"
import { revokeCitizenAttestationWithTx } from "@/lib/eas/serverOnly"
import { extractFailedEasTxContext } from "@/lib/eas/txContext"
import {
  appendServerTraceEvent,
  withMiradorTraceStep,
} from "@/lib/mirador/serverTrace"
import { MiradorTraceContext } from "@/lib/mirador/types"
import { getUserProjectRole } from "@/lib/actions/utils"

export async function resignCitizenSeason(
  citizenSeasonId: string,
  traceContext?: MiradorTraceContext,
) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    console.warn("[citizenship] resign attempt without session", {
      citizenSeasonId,
    })
    return { error: "Unauthorized" }
  }

  const citizenSeason = await prisma.citizenSeason.findUnique({
    where: { id: citizenSeasonId },
  })

  if (!citizenSeason) {
    console.warn("[citizenship] resign attempt for missing record", {
      citizenSeasonId,
      actorUserId: userId,
    })
    return { error: "Citizen record not found" }
  }

  const user = await getUserById(userId)

  if (!user) {
    console.warn("[citizenship] resign attempt with missing user", {
      citizenSeasonId,
      actorUserId: userId,
    })
    return { error: "Unauthorized" }
  }

  const normalizedUserAddresses =
    user.addresses?.map((address) => address.address.toLowerCase()) ?? []

  const governanceAddress = citizenSeason.governanceAddress?.toLowerCase()
  const hasGovernanceWallet =
    governanceAddress !== undefined &&
    normalizedUserAddresses.includes(governanceAddress)

  let hasEntityAdminRights = true
  const isEntityCitizen =
    Boolean(citizenSeason.organizationId) || Boolean(citizenSeason.projectId)

  if (citizenSeason.organizationId) {
    hasEntityAdminRights = await isUserAdminOfOrganization(
      userId,
      citizenSeason.organizationId,
    )
  } else if (citizenSeason.projectId) {
    const role = await getUserProjectRole(citizenSeason.projectId, userId)
    hasEntityAdminRights = role === "admin"
  }

  const isUserCitizen = citizenSeason.userId === userId
  const isAuthorized =
    isUserCitizen ||
    (isEntityCitizen && hasGovernanceWallet && hasEntityAdminRights)

  if (!isAuthorized) {
    console.warn("[citizenship] resign unauthorized", {
      citizenSeasonId,
      actorUserId: userId,
      targetUserId: citizenSeason.userId,
      governanceAddress: citizenSeason.governanceAddress,
      hasGovernanceWallet,
      hasEntityAdminRights,
      organizationId: citizenSeason.organizationId,
      projectId: citizenSeason.projectId,
    })
    return { error: "Unauthorized" }
  }

  const targetType = citizenSeason.organizationId
    ? "organization"
    : citizenSeason.projectId
    ? "project"
    : "user"

  await appendServerTraceEvent({
    traceContext: withMiradorTraceStep(
      traceContext,
      "citizen_resign_start",
      "backend",
    ),
    eventName: "citizen_resign_started",
    details: {
      citizenSeasonId,
      userId,
      targetType,
      attestationId: citizenSeason.attestationId,
    },
    tags: ["citizen", "resignation"],
  })

  let revocationTxHash: string | undefined
  let revocationTxInputData: string | undefined
  let revocationMiradorChain: ReturnType<typeof getMiradorChainNameFromChainId>

  if (citizenSeason.attestationId) {
    try {
      const revocationResult = await revokeCitizenAttestationWithTx(
        citizenSeason.attestationId,
      )
      revocationTxHash = revocationResult.txHash
      revocationTxInputData = revocationResult.txInputData
      revocationMiradorChain = getMiradorChainNameFromChainId(
        revocationResult.chainId,
      )
    } catch (error) {
      console.error("Failed to revoke attestation:", error)
      const failedTxContext = extractFailedEasTxContext(error)
      const failedMiradorChain = getMiradorChainNameFromChainId(
        failedTxContext.chainId,
      )

      await appendServerTraceEvent({
        traceContext: withMiradorTraceStep(
          traceContext,
          "citizen_resign_revocation_failed",
          "backend",
        ),
        eventName: "citizen_resign_failed",
        details: {
          citizenSeasonId,
          attestationId: citizenSeason.attestationId,
          error: error instanceof Error ? error.message : String(error),
        },
        tags: ["citizen", "resignation", "error"],
        txHashHints:
          failedTxContext.txHash && failedMiradorChain
            ? [
                {
                  txHash: failedTxContext.txHash,
                  chain: failedMiradorChain,
                  details: "Failed citizen resignation revocation transaction",
                },
              ]
            : undefined,
        txInputData: failedTxContext.txInputData,
      })

      return { error: "Failed to revoke attestation" }
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.citizenSeason.update({
        where: { id: citizenSeasonId },
        data: {
          registrationStatus: CitizenRegistrationStatus.REVOKED,
        },
      })

      if (citizenSeason.userId) {
        await tx.citizen.delete({
          where: { userId: citizenSeason.userId },
        })
      } else if (citizenSeason.organizationId) {
        await tx.citizen.deleteMany({
          where: { organizationId: citizenSeason.organizationId },
        })
      } else if (citizenSeason.projectId) {
        await tx.citizen.deleteMany({
          where: { projectId: citizenSeason.projectId },
        })
      }
    })
  } catch (error) {
    console.error("Failed to update citizen season:", error)

    await appendServerTraceEvent({
      traceContext: withMiradorTraceStep(
        traceContext,
        "citizen_resign_db_failed",
        "backend",
      ),
      eventName: "citizen_resign_failed",
      details: {
        citizenSeasonId,
        error: error instanceof Error ? error.message : String(error),
      },
      tags: ["citizen", "resignation", "error"],
    })

    return { error: "Failed to update citizen record" }
  }

  const targetUserId = citizenSeason.userId
  if (targetUserId) {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { emails: true },
    })
    const userEmail = targetUser?.emails?.[0]?.email
    if (userEmail) {
      const citizenType = citizenSeason.organizationId
        ? CITIZEN_TYPES.chain
        : citizenSeason.projectId
        ? CITIZEN_TYPES.app
        : CITIZEN_TYPES.user
      const tagToRemove = S9_CITIZEN_TAGS[citizenType]
      try {
        await removeMailchimpTags([
          { email: userEmail, tagsToRemove: [tagToRemove] },
        ])
      } catch (error) {
        console.error("Failed to remove Mailchimp tags:", error)
      }
    }
  }

  await Promise.all([
    revalidatePath("/citizenship"),
    revalidatePath("/dashboard"),
  ])

  await appendServerTraceEvent({
    traceContext: withMiradorTraceStep(
      traceContext,
      "citizen_resign_success",
      "backend",
    ),
    eventName: "citizen_resign_succeeded",
    details: {
      citizenSeasonId,
      actorUserId: userId,
      targetUserId: citizenSeason.userId,
      type: targetType,
    },
    tags: ["citizen", "resignation"],
    txHashHints:
      revocationTxHash && revocationMiradorChain
        ? [
            {
              txHash: revocationTxHash,
              chain: revocationMiradorChain,
              details: "Citizen resignation revocation transaction",
            },
          ]
        : undefined,
    txInputData: revocationTxInputData,
  })

  console.info("[citizenship] resign success", {
    citizenSeasonId,
    actorUserId: userId,
    targetUserId: citizenSeason.userId,
    type: targetType,
  })

  return { success: true }
}
