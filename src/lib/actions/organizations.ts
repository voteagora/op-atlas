"use server"
import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import {
  addOrganizationMembers,
  createOrganization,
  CreateOrganizationParams,
  CreateTeamMemberParams,
  deleteOrganization,
  getOrganizationTeam,
  getUserOrganizationsWithDetails,
  removeOrganizationMember,
  updateOrganization,
  updateOrganizationMemberRole,
  UpdateOrganizationParams,
} from "@/db/organizations"

import { TeamRole } from "../types"
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

  const organizationData = await createOrganization({
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
  revalidatePath("/profile/organizations", "layout")
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
  revalidatePath("/profile/organizations/[organizationId]", "page")
}
