"use server"

import { Organization, Prisma } from "@prisma/client"
import { cache } from "react"

import { OrganizationWithDetails } from "@/lib/types"

import { prisma } from "./client"

async function getOrganizationsFn(userId: string) {
  const result = await prisma.$queryRaw<
    Array<{
      organizations: Array<{
        organization: Organization
      }>
    }>
  >`
    SELECT jsonb_build_object(
      'organizations', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'organization', to_jsonb(o.*)
            )
          )
          FROM "Organization" o
          JOIN "UserOrganization" uo ON o."id" = uo."organizationId"
          WHERE uo."userId" = ${userId}
            AND uo."deletedAt" IS NULL
            AND o."deletedAt" IS NULL
        ),
        '[]'::jsonb
      )
    ) as result
  `

  // Transform the raw result to match the expected structure
  const transformed = result[0] || { organizations: [] }

  // Ensure null arrays are converted to empty arrays
  transformed.organizations = transformed.organizations || []

  return transformed
}

export const getOrganizations = cache(getOrganizationsFn)

async function getAdminOrganizationsFn(userId: string) {
  const result = await prisma.$queryRaw<
    Array<{
      organizations: Array<{
        organization: Organization
      }>
    }>
  >`
    SELECT jsonb_build_object(
      'organizations', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'organization', to_jsonb(o.*)
            )
          )
          FROM "Organization" o
          JOIN "UserOrganization" uo ON o."id" = uo."organizationId"
          WHERE uo."userId" = ${userId}
            AND uo."role" = 'admin'
            AND uo."deletedAt" IS NULL
            AND o."deletedAt" IS NULL
        ),
        '[]'::jsonb
      )
    ) as result
  `

  // Transform the raw result to match the expected structure
  const transformed = result[0] || { organizations: [] }

  // Ensure null arrays are converted to empty arrays
  transformed.organizations = transformed.organizations || []

  return transformed
}

export const getAdminOrganizations = cache(getAdminOrganizationsFn)

async function getUserProjectOrganizationsFn(
  farcasterId: string,
  projectId: string,
) {
  const result = await prisma.$queryRaw<
    {
      result: {
        organizations: Array<
          Prisma.UserOrganizationGetPayload<{}> & {
            organization: OrganizationWithDetails
          }
        >
      }
    }[]
  >`
    SELECT jsonb_build_object(
      'organizations', COALESCE(
        (
          SELECT jsonb_agg(
            to_jsonb(uo.*) ||
            jsonb_build_object(
              'organization', (
                SELECT
                  to_jsonb(o.*) ||
                  jsonb_build_object(
                    'team', (
                      SELECT jsonb_agg(
                        to_jsonb(t.*) || 
                        jsonb_build_object(
                          'user', to_jsonb(u.*)
                        )
                      )
                      FROM "UserOrganization" t
                      JOIN "User" u ON t."userId" = u.id
                      WHERE t."organizationId" = o.id
                        AND t."deletedAt" IS NULL
                    ),
                    'projects', (
                      SELECT jsonb_agg(to_jsonb(p.*))
                      FROM "ProjectOrganization" p
                      WHERE p."organizationId" = o.id
                        AND p."deletedAt" IS NULL
                        AND p."projectId" = ${projectId}
                    )
                  )
                FROM "Organization" o
                WHERE o.id = uo."organizationId"
                  AND o."deletedAt" IS NULL
              )
            )
          )
          FROM "UserOrganization" uo
          JOIN "User" u ON u.id = uo."userId"
          JOIN "ProjectOrganization" po ON uo."organizationId" = po."organizationId"
          WHERE u."farcasterId" = ${farcasterId}
            AND uo."deletedAt" IS NULL
            AND po."projectId" = ${projectId}
        ),
        '[]'::jsonb
      )
    ) as result
  `

  console.log("result for data", result)

  // Transform the raw result to match the expected structure
  const transformed = result[0]?.result || {
    organizations: [],
  }

  return transformed
}

export const getUserProjectOrganizations = cache(getUserProjectOrganizationsFn)

// Get all organizations with detail a user is part of
async function getUserOrganizationsWithDetailsFn(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      organizations: {
        where: { deletedAt: null, organization: { deletedAt: null } },
        include: {
          organization: {
            include: {
              team: {
                include: {
                  user: {},
                },
                where: {
                  deletedAt: null,
                },
              },
              projects: {
                where: {
                  deletedAt: null,
                  project: {
                    deletedAt: null,
                  },
                },
                include: {
                  project: {
                    include: {
                      team: { include: { user: true } },
                      repos: true,
                      contracts: true,
                      funding: true,
                      snapshots: true,
                      applications: true,
                      rewards: { include: { claim: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
}

export const getUserOrganizationsWithDetails = cache(
  getUserOrganizationsWithDetailsFn,
)

export type CreateOrganizationParams = Partial<
  Omit<Organization, "id" | "createdAt" | "updatedAt" | "deletedAt">
> & {
  name: string
}

export type CreateTeamMemberParams = {
  userId: string
  role: string
}

export async function createOrganization({
  organizationId,
  organization,
  teamMembers,
}: {
  organizationId: string
  organization: CreateOrganizationParams
  teamMembers: CreateTeamMemberParams[]
}) {
  // Start a transaction to ensure atomicity
  return prisma.organization.create({
    data: {
      id: organizationId,
      ...organization,
      team: {
        createMany: {
          data: teamMembers.map((member) => ({
            role: member.role,
            userId: member.userId,
          })),
        },
      },
    },
  })
}

// Update an existing organization
export type UpdateOrganizationParams = Partial<
  Omit<Organization, "id" | "createdAt" | "updatedAt" | "deletedAt">
>

export async function updateOrganization({
  id,
  organization,
}: {
  id: string
  organization: UpdateOrganizationParams
}) {
  return prisma.organization.update({
    where: { id },
    data: {
      ...organization,
      updatedAt: new Date(),
    },
  })
}

// Soft delete an organization
export async function deleteOrganization({
  organizationId,
}: {
  organizationId: string
}) {
  return prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}

// Get detailed information about an organization
async function getOrganizationFn({ id }: { id: string }) {
  return prisma.organization.findUnique({
    where: { id },
    include: {
      team: { where: { deletedAt: null }, include: { user: true } },
      projects: true,
    },
  })
}

export const getOrganization = cache(getOrganizationFn)

function getOrganizationWithDetailsFn({ id }: { id: string }) {
  return prisma.organization.findUnique({
    where: { id },
    include: {
      team: {
        include: {
          user: {},
        },
        where: {
          deletedAt: null,
        },
      },
      projects: {
        where: {
          deletedAt: null,
          project: {
            deletedAt: null,
          },
        },
        include: {
          project: {
            include: {
              funding: true,
              snapshots: true,
              applications: true,
              links: true,
              rewards: { include: { claim: true } },
            },
          },
        },
      },
    },
  })
}

export const getOrganizationWithDetails = cache(getOrganizationWithDetailsFn)

export async function addOrganizationSnapshot({
  organizationId,
  ipfsHash,
  attestationId,
}: {
  organizationId: string
  ipfsHash: string
  attestationId: string
}) {
  return prisma.organizationSnapshot.create({
    data: {
      ipfsHash,
      attestationId,
      organization: {
        connect: {
          id: organizationId,
        },
      },
    },
  })
}

// Add members to an organization
export async function addOrganizationMembers({
  organizationId,
  userIds,
  role = "member",
}: {
  organizationId: string
  userIds: string[]
  role?: string
}) {
  return prisma.userOrganization.createMany({
    data: userIds.map((userId) => ({
      organizationId,
      userId,
      role,
    })),
  })
}

// Update a member's role within an organization
export async function updateOrganizationMemberRole({
  organizationId,
  userId,
  role,
}: {
  organizationId: string
  userId: string
  role: string
}) {
  return prisma.userOrganization.update({
    where: {
      userId_organizationId: {
        organizationId,
        userId,
      },
    },
    data: { role },
  })
}

// Remove a member from an organization
export async function removeOrganizationMember({
  organizationId,
  userId,
}: {
  organizationId: string
  userId: string
}) {
  return prisma.userOrganization.delete({
    where: {
      userId_organizationId: {
        organizationId,
        userId,
      },
    },
  })
}

// Get organization contributors
async function getOrganizationTeamFn({ id }: { id: string }) {
  return prisma.organization.findUnique({
    where: {
      id,
    },
    include: {
      team: {
        where: {
          deletedAt: null,
        },
      },
    },
  })
}

export const getOrganizationTeam = cache(getOrganizationTeamFn)

//  Checks if a user is an admin of an organization
export async function isUserAdminOfOrganization(
  userId: string,
  organizationId: string,
) {
  const userOrganization = await prisma.userOrganization.findFirst({
    where: {
      userId,
      organizationId,
      role: "admin",
      deletedAt: null,
    },
  })

  return userOrganization !== null
}
