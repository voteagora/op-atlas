"use server"

import { Prisma } from "@prisma/client"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import {
  addTeamMembers,
  createProject,
  CreateProjectParams,
  deleteProject,
  getProjectTeam,
  getUserAdminProjectsWithDetail,
  getUserApplications,
  getUserProjectsWithDetails,
  removeTeamMember,
  updateMemberRole,
  updateProject,
  updateProjectFunding,
  UpdateProjectParams,
} from "@/db/projects"

import { createProjectAttestation } from "../eas"
import { TeamRole } from "../types"
import { verifyAdminStatus, verifyMembership } from "./utils"

export const getProjects = async (userId: string) => {
  const teams = await getUserProjectsWithDetails({ userId })
  return (teams?.projects ?? []).map(({ project }) => project)
}

export const getAdminProjects = async (userId: string) => {
  const teams = await getUserAdminProjectsWithDetail({ userId })
  return (teams?.projects ?? []).map(({ project }) => project)
}

export const getApplications = async (userId: string) => {
  const teams = await getUserApplications({ userId })
  return (teams?.projects ?? []).flatMap(({ project }) => project.applications)
}

export const getRoundApplications = async (userId: string, roundId: number) => {
  const teams = await getUserApplications({
    userId,
    roundId: roundId.toString(),
  })
  return (teams?.projects ?? []).flatMap(({ project }) => project.applications)
}

export const createNewProject = async (
  details: CreateProjectParams,
  organizationId?: string,
) => {
  const session = await auth()

  if (!session?.user?.id || !session.user.farcasterId) {
    return {
      error: "Unauthorized",
    }
  }

  // Create project attestation
  const attestationId = await createProjectAttestation({
    farcasterId: parseInt(session.user.farcasterId),
  })

  const project = await createProject({
    userId: session.user.id,
    projectId: attestationId,
    project: details,
    organizationId,
  })

  revalidatePath("/dashboard")
  return {
    error: null,
    project,
  }
}

export const createNewProjectOnBehalf = async (
  details: CreateProjectParams,
  userId: string,
  farcasterId: string,
  issuer: string,
) => {
  // Create project attestation
  const attestationId = await createProjectAttestation({
    farcasterId: parseInt(farcasterId),
    issuer,
  })

  return createProject({
    userId: userId,
    projectId: attestationId,
    project: details,
  })
}

export const updateProjectDetails = async (
  projectId: string,
  details: UpdateProjectParams,
  organizationId?: string,
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyMembership(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  const updated = await updateProject({
    id: projectId,
    project: details,
    organizationId,
  })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
  return {
    error: null,
    project: updated,
  }
}

export const deleteUserProject = async (projectId: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyAdminStatus(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  await deleteProject({ id: projectId })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
  return {
    error: null,
    projectId,
  }
}

export const addMembersToProject = async (
  projectId: string,
  userIds: string[],
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyAdminStatus(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  await addTeamMembers({ projectId, userIds })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
}

export const removeMemberFromProject = async (
  projectId: string,
  userId: string,
) => {
  const session = await auth()

  // Can't remove yourself (?)
  if (!session?.user?.id || session.user.id === userId) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyAdminStatus(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  // Can't remove the final team member
  const team = await getProjectTeam({ id: projectId })
  if (team?.team.length === 1) {
    return {
      error: "Cannot remove the final team member",
    }
  }

  await removeTeamMember({ projectId, userId })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
}

export const setMemberRole = async (
  projectId: string,
  userId: string,
  role: TeamRole,
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyAdminStatus(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  await updateMemberRole({ projectId, userId, role })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
}

export const setProjectFunding = async (
  projectId: string,
  funding: Prisma.ProjectFundingCreateManyInput[],
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyMembership(projectId, session.user.farcasterId)
  if (isInvalid?.error) {
    return isInvalid
  }

  await updateProjectFunding({ projectId, funding })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
}
