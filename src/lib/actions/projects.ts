"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import {
  addTeamMembers,
  createProject,
  CreateProjectParams,
  deleteProject,
  getProjectTeam,
  getUserProjects,
  removeTeamMember,
  updateMemberRole,
  updateProject,
} from "@/db/projects"
import { TeamRole } from "../types"

const verifyAdminStatus = async (projectId: string, farcasterId: string) => {
  const userProjects = await getUserProjects({ farcasterId })
  const membership = userProjects?.projects.find(
    ({ project }) => project.id === projectId,
  )

  if (membership?.role !== "owner" && membership?.role !== "admin") {
    return {
      error: "Unauthorized",
    }
  }

  return null
}

export const getProjects = async (farcasterId: string) => {
  const teams = await getUserProjects({ farcasterId })
  return (teams?.projects ?? []).map(({ project }) => project)
}

export const createNewProject = async (details: CreateProjectParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const project = await createProject({
    farcasterId: session.user.id,
    project: details,
  })

  revalidatePath("/dashboard")
  return {
    error: null,
    project,
  }
}

export const updateProjectDetails = async (
  projectId: string,
  details: CreateProjectParams,
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const userProjects = await getUserProjects({ farcasterId: session.user.id })
  if (!userProjects?.projects.some(({ project }) => project.id === projectId)) {
    return {
      error: "Unauthorized",
    }
  }

  const updated = await updateProject({ id: projectId, project: details })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
  return {
    error: null,
    project: updated,
  }
}

/**
 * Deletes a project.
 * Only the owner is allowed to delete the project.
 */
export const deleteUserProject = async (projectId: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const userProjects = await getUserProjects({ farcasterId: session.user.id })
  const membership = userProjects?.projects.find(
    ({ project, role }) => project.id === projectId && role === "admin",
  )

  if (!membership) {
    return {
      error: "Unauthorized",
    }
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

  const isInvalid = await verifyAdminStatus(projectId, session.user.id)
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

  if (!session?.user?.id || session.user.id === userId) {
    return {
      error: "Unauthorized",
    }
  }

  const isInvalid = await verifyAdminStatus(projectId, session.user.id)
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

  const isInvalid = await verifyAdminStatus(projectId, session.user.id)
  if (isInvalid?.error) {
    return isInvalid
  }

  await updateMemberRole({ projectId, userId, role })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
}
