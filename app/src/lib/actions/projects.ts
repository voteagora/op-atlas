"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import {
  addTeamMembers,
  createProject,
  CreateProjectParams,
  deleteProject,
  getAllPublishedUserProjects,
  getProjectTeam,
  getUserAdminProjectsWithDetail,
  getUserApplications,
  getUserProjectsWithDetails,
  removeProjectOrganization,
  removeTeamMember,
  updateMemberRole,
  updateProject,
  updateProjectFunding,
  updateProjectOrganization,
  UpdateProjectParams,
} from "@/db/projects"

import { createEntityAttestation } from "../eas"
import { TeamRole } from "../types"
import { createOrganizationSnapshot } from "./snapshots"
import {
  verifyAdminStatus,
  verifyMembership,
  verifyOrganizationMembership,
} from "./utils"

export const getProjects = async (userId: string) => {
  const teams = await getUserProjectsWithDetails({ userId })
  return (teams?.projects ?? []).map(({ project }) => project)
}

export const getAllPublishedProjects = async (userId: string) => {
  const projects = await getAllPublishedUserProjects({ userId })
  return [
    ...(projects?.projects
      .map(({ project }) => project)
      .filter((project) => project.snapshots.length > 0) ?? []),
    ...(projects?.organizations
      .map((o) => o.organization.projects)
      .flat()
      .map(({ project }) => project)
      .filter((project) => project.snapshots.length > 0) ?? []),
  ]
}

export const getAdminProjects = async (userId: string, roundId?: string) => {
  const teams = await getUserAdminProjectsWithDetail({ userId, roundId })
  const teamProjects = teams?.projects.map(({ project }) => project) ?? []
  const organizationProjects =
    teams?.organizations
      .map(({ organization }) => organization.projects)
      .flat()
      .map(({ project }) => project) ?? []

  // Filter out duplicates
  const organizationProjectIds = organizationProjects.map(({ id }) => id)
  const filteredTeamProjects = teamProjects.filter(
    ({ id }) => !organizationProjectIds.includes(id),
  )
  return [...filteredTeamProjects, ...organizationProjects]
}

export const getApplications = async (userId: string) => {
  const userApplications = await getUserApplications({ userId })
  return userApplications
}

export const getRoundApplications = async (userId: string, roundId: number) => {
  const userApplications = await getUserApplications({
    userId,
    roundId: roundId.toString(),
  })
  return userApplications
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

  // Create entity attestation
  const attestationId = await createEntityAttestation({
    farcasterId: parseInt(session.user.farcasterId),
    type: "project",
  })

  const project = await createProject({
    userId: session.user.id,
    projectId: attestationId,
    project: details,
    organizationId,
  })

  await setProjectOrganization(project.id, undefined, organizationId)

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
) => {
  // Create project attestation
  const attestationId = await createEntityAttestation({
    farcasterId: parseInt(farcasterId),
    type: "project",
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
  })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
  return {
    error: null,
    project: updated,
  }
}

export const setProjectOrganization = async (
  projectId: string,
  oldOrganizationId?: string,
  organizationId?: string,
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  // Skip if the organization hasn't changed
  if (oldOrganizationId === organizationId) {
    return {
      error: null,
      organizationId,
    }
  }

  // Only project admins can set the organization
  const projectAdmin = verifyAdminStatus(projectId, session.user.farcasterId)

  // Only organization admins can remove the organization
  const oldOrganizationAdmin = oldOrganizationId
    ? verifyOrganizationMembership(oldOrganizationId, session.user.id)
    : null

  const isInvalid = (
    await Promise.all([projectAdmin, oldOrganizationAdmin])
  ).reduce((acc, val) => acc || val, null)
  if (isInvalid?.error) {
    return isInvalid
  }

  if (!organizationId) {
    await removeProjectOrganization({ projectId })

    if (oldOrganizationId) {
      // Create organization snapshot
      await createOrganizationSnapshot(oldOrganizationId)
    }
  } else {
    // Only organization admins can set the organization
    const isOrganizationAdmin = await verifyOrganizationMembership(
      organizationId,
      session.user.id,
    )

    if (isOrganizationAdmin?.error) {
      return isOrganizationAdmin
    }

    await updateProjectOrganization({ projectId, organizationId })

    // Create organization snapshot
    await Promise.all([
      createOrganizationSnapshot(organizationId),
      oldOrganizationId && createOrganizationSnapshot(oldOrganizationId),
    ])
  }

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")

  return {
    error: null,
    organizationId,
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
