import {
  getUserOrganizationsWithDetails,
  getUserProjectOrganizations,
  isUserAdminOfOrganization,
} from "@/db/organizations"
import { getUserProjects } from "@/db/projects"

import { ProjectTeam, ProjectWithDetails } from "../types"

export const isUserMember = async (
  project: ProjectWithDetails,
  userId?: string,
) => {
  // TODO: must check the organization team as well
  return userId && project.team.some((member) => member.userId === userId)
}

export const isUserMemberOfProject = (
  project: ProjectTeam,
  userId?: string,
) => {
  return (
    userId &&
    project.team.some((member) =>
      member.user.some((user) => user.id === userId),
    )
  )
}

export const projectMembers = (project: ProjectWithDetails) => {
  const projectTeam = project.team.map((user) => {
    return {
      ...user,
      organizationId: undefined,
    }
  })
  const organizationTeam = (project.organization?.organization?.team || []).map(
    (user) => {
      return {
        ...user,
        organizationId: project.organization?.organizationId,
      }
    },
  )

  return [
    // filter out project memeber if they are admin of organization
    ...projectTeam.filter((user) => {
      return !organizationTeam.some((organizationUser) => {
        return (
          user.userId === organizationUser.userId &&
          organizationUser.role === "admin"
        )
      })
    }),
    // filter out organization contributor if they are admin or contributor of project
    ...organizationTeam.filter((user) => {
      if (user.role === "admin") {
        return true
      }
      return !projectTeam.some((projectUser) => {
        return user.userId === projectUser.userId
      })
    }),
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
