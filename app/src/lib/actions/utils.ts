import {
  getUserOrganizationsWithDetails,
  getUserOrganizationsWithDetailsWithClient,
  getUserProjectOrganizations,
  getUserProjectOrganizationsWithClient,
  isUserAdminOfOrganization,
} from "@/db/organizations"
import {
  getUserProjects,
  getUserProjectsWithClient,
} from "@/db/projects"
import type { PrismaClient } from "@prisma/client"

import { ProjectWithDetails } from "../types"

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

export type MembershipError =
  | null
  | {
      error: string
      context: "project" | "organization" | "both"
    }

export const verifyMembership = async (
  projectId: string,
  userId: string,
  db?: PrismaClient,
): Promise<MembershipError> => {
  const [projects, userProjectOrganizations] = await Promise.all([
    db
      ? getUserProjectsWithClient({ userId }, db)
      : getUserProjects({ userId }),
    db
      ? getUserProjectOrganizationsWithClient(userId, projectId, db)
      : getUserProjectOrganizations(userId, projectId),
  ])
  const projectMembership = projects?.projects.find(
    ({ project }) => project.id === projectId,
  )

  const organizationMembership = userProjectOrganizations?.organizations.find(
    ({ organization }) => organization.projects.length > 0,
  )

  if (!organizationMembership && !projectMembership) {
    return {
      error: "Unauthorized",
      context: "both",
    }
  }

  return null
}

export const verifyAdminStatus = async (
  projectId: string,
  userId: string,
  db?: PrismaClient,
) => {
  const [projects, userProjectOrganizations] = await Promise.all([
    db
      ? getUserProjectsWithClient({ userId }, db)
      : getUserProjects({ userId }),
    db
      ? getUserProjectOrganizationsWithClient(userId, projectId, db)
      : getUserProjectOrganizations(userId, projectId),
  ])
  const projectMembership = projects?.projects.find(
    (item) => item.project.id === projectId,
  )

  const organizationMembership = userProjectOrganizations?.organizations.find(
    (item) => item.organization.projects.length > 0,
  )

  const isProjectAdmin = projectMembership?.role === "admin"
  const isOrganizationAdmin = organizationMembership?.role === "admin"

  if (!isProjectAdmin && !isOrganizationAdmin) {
    let context: "project" | "organization" | "both" = "both"
    if (projectMembership && !organizationMembership) {
      context = "project"
    } else if (!projectMembership && organizationMembership) {
      context = "organization"
    }
    return {
      error: "Unauthorized",
      context,
    }
  }

  return null
}

export const verifyOrganizationMembership = async (
  organizationId: string,
  userId: string,
  db?: PrismaClient,
) => {
  const userOrganization = db
    ? await getUserOrganizationsWithDetailsWithClient(userId, db)
    : await getUserOrganizationsWithDetails(userId)
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
  db?: PrismaClient,
) => {
  const isAdmin = await isUserAdminOfOrganization(userId, organizationId, db)

  if (!isAdmin) {
    return {
      error: "Unauthorized",
    }
  }

  return null
}

export const getUserProjectRole = async (
  projectId: string,
  userId: string,
  db?: PrismaClient,
): Promise<"admin" | "member" | null> => {
  const [projects, userProjectOrganizations] = await Promise.all([
    db
      ? getUserProjectsWithClient({ userId }, db)
      : getUserProjects({ userId }),
    db
      ? getUserProjectOrganizationsWithClient(userId, projectId, db)
      : getUserProjectOrganizations(userId, projectId),
  ])

  // Check direct project membership
  const projectMembership = projects?.projects.find(
    (item) => item.project.id === projectId,
  )

  // Check organization membership for projects belonging to organizations
  const organizationMembership = userProjectOrganizations?.organizations.find(
    (item) => item.organization.projects.length > 0,
  )

  // Determine role
  if (projectMembership?.role === "admin" || organizationMembership?.role === "admin") {
    return "admin"
  }
  
  if (projectMembership || organizationMembership) {
    return "member"
  }

  return null
}

export const getUserOrganizationRole = async (
  organizationId: string,
  userId: string,
  db?: PrismaClient,
): Promise<"admin" | "member" | null> => {
  const userOrganization = db
    ? await getUserOrganizationsWithDetailsWithClient(userId, db)
    : await getUserOrganizationsWithDetails(userId)
  const membership = userOrganization?.organizations.find(
    ({ organization }) => organization.id === organizationId,
  )

  if (!membership) {
    return null
  }

  return membership.role === "admin" ? "admin" : "member"
}

export function parseEnumValue<E>(
  enumObj: Record<string, string>,
  value: string,
): E {
  if ((Object.values(enumObj) as string[]).includes(value)) {
    return value as E
  }
  throw new Error(`Invalid enum value: '${value}'`)
}
