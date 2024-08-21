"use server"

import { Organization } from "@prisma/client"

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

export async function getAdminOrganizations(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      organizations: {
        where: { deletedAt: null, role: "admin" },
        include: {
          organization: true,
        },
      },
    },
  })
}

export async function getUserProjectOrganizations(
  farcasterId: string,
  projectId: string,
) {
  return prisma.user.findUnique({
    where: { id: farcasterId },
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
                  id: projectId,
                },
              },
            },
          },
        },
      },
    },
  })
}

// Get all organizations with detail a user is part of
export async function getUserOrganizationsWithDetails(farcasterId: string) {
  return prisma.user.findUnique({
    where: { id: farcasterId },
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
export async function getOrganization({ id }: { id: string }) {
  return prisma.organization.findUnique({
    where: { id },
    include: {
      team: { where: { deletedAt: null }, include: { user: true } },
      projects: true,
    },
  })
}

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
