"use server"
import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import {
  addOrganizationMembers,
  createOrganization,
  createOrganizationKycTeam,
  CreateOrganizationParams,
  CreateTeamMemberParams,
  deleteOrganization,
  getOrganizationKYCTeams,
  getOrganizationTeam,
  getUserOrganizationsWithDetails,
  removeOrganizationMember,
  updateOrganization,
  updateOrganizationMemberRole,
  UpdateOrganizationParams,
} from "@/db/organizations"

import { createEntityAttestation } from "../eas"
import { TeamRole } from "../types"
import { createOrganizationSnapshot } from "./snapshots"
import { verifyOrganizationAdmin } from "./utils"

export const getUserOrganizations = async (userId: string) => {
  const user = await getUserOrganizationsWithDetails(userId)
  return user?.organizations
}

export const createNewOrganization = async ({
  organization,
  teamMembers,
}: {
  organization: CreateOrganizationParams
  teamMembers: CreateTeamMemberParams[]
}) => {
  const session = await auth()

  if (!session?.user?.id || !session.user.farcasterId) {
    return {
      error: "Unauthorized",
    }
  }

  // Create entity attestation
  const organizationId = await createEntityAttestation({
    farcasterId: parseInt(session.user.farcasterId),
    type: "organization",
  })

  const organizationData = await createOrganization({
    organizationId,
    organization,
    teamMembers,
  })

  revalidatePath("/dashboard")
  return {
    error: null,
    organizationData: organizationData,
  }
}

export const updateOrganizationDetails = async ({
  organization,
  id,
}: {
  organization: UpdateOrganizationParams
  id: string
}) => {
  const session = await auth()

  if (!session?.user?.id || !session.user.farcasterId) {
    return {
      error: "Unauthorized",
    }
  }

  const organizationData = await updateOrganization({
    id,
    organization,
  })

  await createOrganizationSnapshot(id)

  revalidatePath("/dashboard")
  revalidatePath("/profile", "layout")
  return {
    error: null,
    organizationData: organizationData,
  }
}

export const deleteUserOrganization = async (organizationId: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyOrganizationAdmin(
    organizationId,
    session.user.id,
  )
  if (isInvalid?.error) {
    return isInvalid
  }

  await deleteOrganization({ organizationId })

  revalidatePath("/dashboard")
  revalidatePath("/profile", "layout")
  return {
    error: null,
    organizationId,
  }
}

export const addMemberToOrganization = async (
  organizationId: string,
  userIds: string[],
) => {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }
  const isInvalid = await verifyOrganizationAdmin(
    organizationId,
    session.user.id,
  )

  if (isInvalid?.error) {
    return isInvalid
  }

  await addOrganizationMembers({ organizationId, userIds })

  revalidatePath("/dashboard")
  revalidatePath("/profile", "layout")
}

export const setOrganizationMemberRole = async (
  organizationId: string,
  userId: string,
  role: TeamRole,
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }
  const isInvalid = await verifyOrganizationAdmin(
    organizationId,
    session.user.id,
  )
  if (isInvalid?.error) {
    return isInvalid
  }

  await updateOrganizationMemberRole({ organizationId, userId, role })

  revalidatePath("/dashboard")
  revalidatePath("/profile", "layout")
}

export const removeMemberFromOrganization = async (
  organizationId: string,
  userId: string,
) => {
  const session = await auth()

  // Can't remove yourself (?)
  if (!session?.user?.id || session.user.id === userId) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyOrganizationAdmin(
    organizationId,
    session.user.id,
  )
  if (isInvalid?.error) {
    return isInvalid
  }

  // Can't remove the final team member
  const team = await getOrganizationTeam({ id: organizationId })
  if (team?.team.length === 1) {
    return {
      error: "Cannot remove the final team member",
    }
  }

  await removeOrganizationMember({ organizationId, userId })
  revalidatePath("/dashboard")
  revalidatePath("/profile", "layout")
}

export const createOrganizationKycTeamAction = async ({
  walletAddress,
  organizationId,
}: {
  walletAddress: string
  organizationId: string
}) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const isInvalid = await verifyOrganizationAdmin(
    organizationId,
    session.user.id,
  )
  if (isInvalid?.error) {
    return isInvalid
  }

  const createdOrganizationKycTeam = await createOrganizationKycTeam({
    walletAddress,
    organizationId,
  })

  revalidatePath("/organizations", "layout")

  return createdOrganizationKycTeam
}

export const getOrganizationKycTeamsAction = async ({
  organizationId,
}: {
  organizationId: string
}) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const isInvalid = await verifyOrganizationAdmin(
    organizationId,
    session.user.id,
  )
  if (isInvalid?.error) {
    throw new Error(isInvalid.error)
  }

  return getOrganizationKYCTeams({ organizationId })
}
