"use server"
import type { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { deleteKycTeam } from "@/db/kyc"
import { checkWalletAddressExists, getKycTeamByWalletAddress } from "@/db/kyc"
import {
  addOrganizationMembers,
  createOrganization,
  createOrganizationKycTeam,
  CreateOrganizationParams,
  CreateTeamMemberParams,
  deleteOrganization,
  getOrganizationKYCTeams,
  getOrganizationTeamWithClient,
  getUserOrganizationsWithDetailsWithClient,
  isUserAdminOfOrganization,
  removeOrganizationMember,
  updateOrganization,
  updateOrganizationMemberRole,
  UpdateOrganizationParams,
} from "@/db/organizations"
import { getUserById } from "@/db/users"
import { withImpersonation } from "@/lib/db/sessionContext"
import {
  getKycAudienceForOrganization,
  getOrganizationAudience,
  toOrganizationDTO,
  toOrganizationKycTeamsDTO,
} from "@/lib/dto"
import { extractFailedEasTxContext } from "@/lib/eas/txContext"
import { getMiradorChainNameFromChainId } from "@/lib/mirador/chains"

import { createEntityAttestationWithTx } from "../eas/serverOnly"
import {
  appendServerTraceEvent,
  withMiradorTraceStep,
} from "../mirador/serverTrace"
import { MiradorTraceContext } from "../mirador/types"
import { TeamRole } from "../types"
import { createOrganizationSnapshot } from "./snapshots"
import { verifyOrganizationAdmin, verifyOrganizationMembership } from "./utils"

export const getUserOrganizations = async (userId: string) =>
  withImpersonation(
    async ({ db, userId: sessionUserId }) => {
      if (!sessionUserId || sessionUserId !== userId) {
        return []
      }

      const user = await getUserOrganizationsWithDetailsWithClient(userId, db)

      return Promise.all(
        (user?.organizations ?? []).map(async (organization) => {
          const audience = await getOrganizationAudience(
            db,
            organization.organization.id,
            sessionUserId,
          )
          return {
            ...organization,
            organization: toOrganizationDTO(
              organization.organization,
              audience,
            ),
          }
        }),
      )
    },
    { requireUser: true },
  )

export const createNewOrganization = async ({
  organization,
  teamMembers,
  traceContext,
}: {
  organization: CreateOrganizationParams
  teamMembers: CreateTeamMemberParams[]
  traceContext?: MiradorTraceContext
}) =>
  withImpersonation(
    async ({ db, userId, session }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const user = await getUserById(userId, db, session)
      if (!user) {
        return {
          error: "User not found",
        }
      }

      await appendServerTraceEvent({
        traceContext: withMiradorTraceStep(
          traceContext,
          "organization_creation_start",
          "backend",
        ),
        eventName: "organization_creation_started",
        details: { userId, organizationName: organization.name },
        tags: ["organization", "creation"],
      })

      try {
        const {
          attestationId: organizationId,
          txHash,
          chainId,
          txInputData,
        } = await createEntityAttestationWithTx({
          farcasterId: user?.farcasterId ? parseInt(user.farcasterId) : 0,
          type: "organization",
        })
        const miradorChain = getMiradorChainNameFromChainId(chainId)

        const organizationData = await createOrganization(
          {
            organizationId,
            organization,
            teamMembers,
          },
          db,
        )

        await appendServerTraceEvent({
          traceContext: withMiradorTraceStep(
            traceContext,
            "organization_creation_success",
            "backend",
          ),
          eventName: "organization_creation_succeeded",
          details: { userId, organizationId },
          tags: ["organization", "creation"],
          txHashHints:
            txHash && miradorChain
              ? [
                  {
                    txHash,
                    chain: miradorChain,
                    details: "Organization entity attestation transaction",
                  },
                ]
              : undefined,
          txInputData,
        })

        revalidatePath("/dashboard")
        return {
          error: null,
          organizationData,
        }
      } catch (error) {
        const failedTxContext = extractFailedEasTxContext(error)
        const failedMiradorChain = getMiradorChainNameFromChainId(
          failedTxContext.chainId,
        )

        await appendServerTraceEvent({
          traceContext: withMiradorTraceStep(
            traceContext,
            "organization_creation_exception",
            "backend",
          ),
          eventName: "organization_creation_failed",
          details: {
            userId,
            error: error instanceof Error ? error.message : String(error),
          },
          tags: ["organization", "creation", "error"],
          txHashHints:
            failedTxContext.txHash && failedMiradorChain
              ? [
                  {
                    txHash: failedTxContext.txHash,
                    chain: failedMiradorChain,
                    details:
                      "Failed organization entity attestation transaction",
                  },
                ]
              : undefined,
          txInputData: failedTxContext.txInputData,
        })

        throw error
      }
    },
    { requireUser: true },
  )

export const updateOrganizationDetails = async ({
  organization,
  id,
}: {
  organization: UpdateOrganizationParams
  id: string
}) =>
  withImpersonation(
    async ({ db, userId, session }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const isInvalid = await verifyOrganizationAdmin(id, userId, db)
      if (isInvalid?.error) {
        return isInvalid
      }

      const organizationData = await updateOrganization(
        {
          id,
          organization,
        },
        db,
      )

      await createOrganizationSnapshot(id)

      revalidatePath("/dashboard")
      revalidatePath("/profile", "layout")
      return {
        error: null,
        organizationData,
      }
    },
    { requireUser: true },
  )

export const deleteUserOrganization = async (organizationId: string) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const isInvalid = await verifyOrganizationAdmin(
        organizationId,
        userId,
        db,
      )
      if (isInvalid?.error) {
        return isInvalid
      }

      await deleteOrganization({ organizationId }, db)

      revalidatePath("/dashboard")
      revalidatePath("/profile", "layout")
      return {
        error: null,
        organizationId,
      }
    },
    { requireUser: true },
  )

export const addMemberToOrganization = async (
  organizationId: string,
  userIds: string[],
) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const isInvalid = await verifyOrganizationAdmin(
        organizationId,
        userId,
        db,
      )

      if (isInvalid?.error) {
        return isInvalid
      }

      await addOrganizationMembers({ organizationId, userIds }, db)

      revalidatePath("/dashboard")
      revalidatePath("/profile", "layout")
      return { error: null }
    },
    { requireUser: true },
  )

export const setOrganizationMemberRole = async (
  organizationId: string,
  memberId: string,
  role: TeamRole,
) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }
      const isInvalid = await verifyOrganizationAdmin(
        organizationId,
        userId,
        db,
      )
      if (isInvalid?.error) {
        return isInvalid
      }

      const teamHasAdmin = await checkTeamHasAdminOtherThanUser(
        {
          organizationId,
          userToRemove: memberId,
        },
        db,
      )

      if (!teamHasAdmin) {
        return {
          error: "At least 1 member on the team must be an Admin",
        }
      }

      await updateOrganizationMemberRole(
        { organizationId, userId: memberId, role },
        db,
      )

      revalidatePath("/dashboard")
      revalidatePath("/profile", "layout")
      return { error: null }
    },
    { requireUser: true },
  )

export const checkTeamHasAdminOtherThanUser = async (
  {
    organizationId,
    userToRemove,
  }: {
    organizationId: string
    userToRemove: string
  },
  db: PrismaClient,
) => {
  const team = await getOrganizationTeamWithClient({ id: organizationId }, db)

  const adminChecks = await Promise.all(
    team?.team.map((member) =>
      member.userId !== userToRemove
        ? isUserAdminOfOrganization(member.userId, organizationId, db)
        : Promise.resolve(false),
    ) ?? [],
  )

  return adminChecks.some(Boolean)
}

export const removeMemberFromOrganization = async (
  organizationId: string,
  userId: string,
) =>
  withImpersonation(
    async ({ db, userId: sessionUserId }) => {
      if (!sessionUserId) {
        return {
          error: "Unauthorized",
        }
      }

      const isInvalid = await verifyOrganizationAdmin(
        organizationId,
        sessionUserId,
        db,
      )
      if (isInvalid?.error) {
        return isInvalid
      }

      const team = await getOrganizationTeamWithClient(
        { id: organizationId },
        db,
      )
      if (team?.team.length === 1) {
        return {
          error: "Cannot remove the final team member",
        }
      }

      const teamHasAdmin = await checkTeamHasAdminOtherThanUser(
        {
          organizationId,
          userToRemove: userId,
        },
        db,
      )

      if (!teamHasAdmin) {
        return {
          error: "At least 1 admin member must remain in the team",
        }
      }

      await removeOrganizationMember({ organizationId, userId }, db)
      revalidatePath("/dashboard")
      revalidatePath("/profile", "layout")
      return { error: null }
    },
    { requireUser: true },
  )

export const checkWalletAddressExistsForOrganizationAction = async (
  walletAddress: string,
) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const exists = await checkWalletAddressExists(walletAddress, db)
      return { exists }
    },
    { requireUser: true },
  )

export const getKycTeamByWalletAddressForOrganizationAction = async (
  walletAddress: string,
) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      return getKycTeamByWalletAddress(walletAddress, db)
    },
    { requireUser: true },
  )

export const createOrganizationKycTeamAction = async ({
  walletAddress,
  organizationId,
}: {
  walletAddress: string
  organizationId: string
}) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const isInvalid = await verifyOrganizationAdmin(
        organizationId,
        userId,
        db,
      )
      if (isInvalid?.error) {
        return isInvalid
      }

      const createdOrganizationKycTeam = await createOrganizationKycTeam(
        {
          walletAddress,
          organizationId,
        },
        db,
      )

      revalidatePath("/organizations", "layout")

      return createdOrganizationKycTeam
    },
    { requireUser: true },
  )

export const getOrganizationKycTeamsAction = async ({
  organizationId,
}: {
  organizationId: string
}) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const isInvalid = await verifyOrganizationMembership(
        organizationId,
        userId,
        db,
      )
      if (isInvalid?.error) {
        throw new Error(isInvalid.error)
      }

      const audience = await getKycAudienceForOrganization(
        db,
        organizationId,
        userId,
      )
      if (!audience) {
        throw new Error("Unauthorized")
      }

      const teams = await getOrganizationKYCTeams({ organizationId }, db)
      return toOrganizationKycTeamsDTO(teams, audience)
    },
    { requireUser: true },
  )

export const deleteOrganizationKYCTeam = async ({
  organizationId,
  kycTeamId,
  hasActiveStream,
}: {
  organizationId: string
  kycTeamId: string
  hasActiveStream: boolean
}) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const isInvalid = await verifyOrganizationAdmin(
        organizationId,
        userId,
        db,
      )
      if (isInvalid?.error) {
        throw new Error(isInvalid.error)
      }

      return deleteKycTeam(
        {
          kycTeamId,
          hasActiveStream,
        },
        db,
      )
    },
    { requireUser: true },
  )
