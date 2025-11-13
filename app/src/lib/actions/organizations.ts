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

import { createEntityAttestation } from "../eas/serverOnly"
import { TeamRole } from "../types"
import { createOrganizationSnapshot } from "./snapshots"
import { verifyOrganizationAdmin, verifyOrganizationMembership } from "./utils"

export const getUserOrganizations = async (userId: string) =>
  withImpersonation(async ({ db }) => {
    const user = await getUserOrganizationsWithDetailsWithClient(userId, db)
    return user?.organizations
  })

export const createNewOrganization = async ({
  organization,
  teamMembers,
}: {
  organization: CreateOrganizationParams
  teamMembers: CreateTeamMemberParams[]
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

      const organizationId = await createEntityAttestation({
        farcasterId: user?.farcasterId ? parseInt(user.farcasterId) : 0,
        type: "organization",
      })

      const organizationData = await createOrganization(
        {
          organizationId,
          organization,
          teamMembers,
        },
        db,
      )

      revalidatePath("/dashboard")
      return {
        error: null,
        organizationData,
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

      const team = await getOrganizationTeamWithClient({ id: organizationId }, db)
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

      return getOrganizationKYCTeams({ organizationId }, db)
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
