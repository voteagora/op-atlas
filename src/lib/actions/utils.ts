import { getUserProjects } from "@/db/projects"

import { ProjectWithDetails } from "../types"

export const isUserMember = async (
  projectId: ProjectWithDetails,
  userId?: string,
) => {
  return userId && projectId.team.some((member) => member.userId === userId)
}

export const verifyMembership = async (
  projectId: string,
  farcasterId: string,
) => {
  const userProjects = await getUserProjects({ farcasterId })
  const membership = userProjects?.projects.find(
    ({ project }) => project.id === projectId,
  )

  if (!membership) {
    return {
      error: "Unauthorized",
    }
  }

  return null
}

export const verifyAdminStatus = async (
  projectId: string,
  farcasterId: string,
) => {
  const userProjects = await getUserProjects({ farcasterId })
  const membership = userProjects?.projects.find(
    ({ project }) => project.id === projectId,
  )

  if (membership?.role !== "admin") {
    return {
      error: "Unauthorized",
    }
  }

  return null
}
