import {
  getUserOrganizationsWithDetails,
  getUserProjectOrganizations,
  isUserAdminOfOrganization,
} from "@/db/organizations"
import { getUserProjects } from "@/db/projects"

import { ProjectWithDetails } from "../types"

export const isUserMember = async (
  project: ProjectWithDetails,
  userId?: string,
) => {
  return userId && project.team.some((member) => member.userId === userId)
}

export const projectMembers = (project: ProjectWithDetails) => {
  const projectTeam = project.team
  const organizationTeam = project.organization?.organization?.team

  // filter out duplicates
  return [
    ...projectTeam,
    ...(organizationTeam || []).filter(
      (member) =>
        !projectTeam.some(
          (projectMember) => projectMember.userId === member.userId,
        ),
    ),
  ]
}

export const verifyMembership = async (
  projectId: string,
  farcasterId: string,
) => {
  const [userProjects, userProjectOrganizations] = await Promise.all([
    getUserProjects({ farcasterId }),
    getUserProjectOrganizations(farcasterId, projectId),
  ])
  const projectMembership = userProjects?.projects.find(
    ({ project }) => project.id === projectId,
  )

  const organizationMembership = userProjectOrganizations?.organizations.find(
    ({ organization }) => organization.projects.length > 0,
  )

  if (!organizationMembership && !projectMembership) {
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
  const [userProjects, userProjectOrganizations] = await Promise.all([
    getUserProjects({ farcasterId }),
    getUserProjectOrganizations(farcasterId, projectId),
  ])
  const projectMembership = userProjects?.projects.find(
    ({ project }) => project.id === projectId,
  )

  const organizationMembership = userProjectOrganizations?.organizations.find(
    ({ organization }) => organization.projects.length > 0,
  )

  if (
    projectMembership?.role !== "admin" &&
    organizationMembership?.role !== "admin"
  ) {
    return {
      error: "Unauthorized",
    }
  }

  return null
}

export const verifyOrganizationMembership = async (
  organizationId: string,
  userId: string,
) => {
  const userOrganization = await getUserOrganizationsWithDetails(userId)
  const membership = userOrganization?.organizations.find(
    ({ organization }) => organization.id === organizationId,
  )

  if (!membership) {
    return {
      error: "Unauthorized",
    }
  }
  return null
}

export const verifyOrganizationAdmin = async (
  organizationId: string,
  userId: string,
) => {
  const isAdmin = await isUserAdminOfOrganization(userId, organizationId)

  if (!isAdmin) {
    return {
      error: "Unauthorized",
    }
  }

  return null
}
