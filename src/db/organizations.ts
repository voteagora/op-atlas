"use server"

import { Organization, Prisma } from "@prisma/client"

import { TeamRole } from "@/lib/types"

import { prisma } from "./client"

export async function getOrganizations(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      organizations: {
        where: { deletedAt: null },
        include: {
          organization: true,
        },
      },
    },
  })
}

// Get all organizations with detail a user is part of
export async function getUserOrganizationsWithDetails(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      organizations: {
        where: { deletedAt: null },
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
  organization,
  teamMembers,
}: {
  organization: CreateOrganizationParams
  teamMembers: CreateTeamMemberParams[]
}) {
  // Start a transaction to ensure atomicity
  return prisma.$transaction(async (prisma) => {
    // Create the organization
    const createdOrganization = await prisma.organization.create({
      data: organization,
    })

    // Prepare team member data for batch insertion
    const teamMemberData = teamMembers.map((member) => ({
      role: member.role,
      userId: member.userId,
      organizationId: createdOrganization.id,
    }))

    // Create the team members
    await prisma.userOrganization.createMany({
      data: teamMemberData,
    })

    return createdOrganization
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
  return await prisma.$transaction([
    prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        deletedAt: new Date(),
      },
    }),
    prisma.userOrganization.updateMany({
      where: {
        organizationId: organizationId,
        deletedAt: null, // Ensures only non-deleted records are updated
      },
      data: {
        deletedAt: new Date(),
      },
    }),
  ])
}

// Get detailed information about an organization
export async function getOrganization(id: string) {
  return prisma.organization.findUnique({
    where: { id },
    include: {
      team: { where: { deletedAt: null }, include: { user: true } },
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
  const deletedMembers = await prisma.userOrganization.findMany({
    where: {
      organizationId,
      userId: { in: userIds },
    },
  })

  const updateMemberIds = deletedMembers.map((m) => m.userId)
  const createMemberIds = userIds.filter((id) => !updateMemberIds.includes(id))

  const memberUpdate = prisma.userOrganization.updateMany({
    where: {
      organizationId,
      userId: { in: updateMemberIds },
    },
    data: { deletedAt: null },
  })

  const memberCreate = prisma.userOrganization.createMany({
    data: createMemberIds.map((userId) => ({
      role,
      userId,
      organizationId,
    })),
  })

  return prisma.$transaction([memberUpdate, memberCreate])
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

// Update a member's role within an organization
export async function addProjectMember({
  organizationId,
  userIds,
  role = "member",
}: {
  organizationId: string
  userIds: string[]
  role?: TeamRole
}) {
  // There may be users who were previously soft deleted, so this is complex
  const deletedMembers = await prisma.userOrganization.findMany({
    where: {
      organizationId,
      userId: {
        in: userIds,
      },
    },
  })

  const updateMemberIds = deletedMembers.map((m) => m.userId)
  const createMemberIds = userIds.filter((id) => !updateMemberIds.includes(id))

  const memberUpdate = prisma.userOrganization.updateMany({
    where: {
      organizationId,
      userId: {
        in: updateMemberIds,
      },
    },
    data: {
      deletedAt: null,
    },
  })

  const memberCreate = prisma.userOrganization.createMany({
    data: createMemberIds.map((userId) => ({
      role,
      userId,
      organizationId,
    })),
  })

  const organizationUpdate = prisma.project.update({
    where: {
      id: organizationId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([memberUpdate, memberCreate, organizationUpdate])
}

// Remove a member from an organization (soft delete)
export async function removeOrganizationMember({
  organizationId,
  userId,
}: {
  organizationId: string
  userId: string
}) {
  return prisma.userOrganization.update({
    where: {
      userId_organizationId: {
        organizationId,
        userId,
      },
    },
    data: {
      role: "member",
      deletedAt: new Date(),
    },
  })
}

// Get organization contributors
export async function getOrganizationTeam({ id }: { id: string }) {
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
