"use server"

import { Organization, Prisma, PrismaClient } from "@prisma/client"
import { cache } from "react"

import {
  OrganizationWithDetails,
  UserOrganizationsWithDetails,
} from "@/lib/types"

import { prisma } from "./client"

async function getOrganizationsFn(userId: string, db: PrismaClient) {
  const result = await db.$queryRaw<
    {
      result: {
        organizations: Array<{
          organization: Organization
        }>
      }
    }[]
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
  return (
    result[0]?.result.organizations.map(
      (organizationObj) => organizationObj.organization,
    ) || []
  )
}

export const getOrganizations = cache((userId: string) =>
  getOrganizationsFn(userId, prisma),
)

export async function getOrganizationsWithClient(
  userId: string,
  db: PrismaClient = prisma,
) {
  return getOrganizationsFn(userId, db)
}

async function getAdminOrganizationsFn(userId: string, db: PrismaClient = prisma) {
  const result = await db.$queryRaw<
    {
      result: {
        organizations: Array<{
          organization: Organization
        }>
      }
    }[]
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
  const transformed = result[0]?.result || { organizations: [] }

  // Ensure null arrays are converted to empty arrays
  transformed.organizations = transformed.organizations || []

  return transformed
}

export const getAdminOrganizations = cache((userId: string) =>
  getAdminOrganizationsFn(userId, prisma),
)

export async function getAdminOrganizationsWithClient(
  userId: string,
  db: PrismaClient = prisma,
) {
  return getAdminOrganizationsFn(userId, db)
}

async function getUserProjectOrganizationsFn(
  userId: string,
  projectId: string,
  db: PrismaClient = prisma,
) {
  const result = await db.$queryRaw<
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
          WHERE u."id" = ${userId}
            AND uo."deletedAt" IS NULL
            AND po."projectId" = ${projectId}
        ),
        '[]'::jsonb
      )
    ) as result
  `

  // Transform the raw result to match the expected structure
  return (
    result[0]?.result || {
      organizations: [],
    }
  )
}

export const getUserProjectOrganizations = cache(
  (userId: string, projectId: string) =>
    getUserProjectOrganizationsFn(userId, projectId),
)

export async function getUserProjectOrganizationsWithClient(
  userId: string,
  projectId: string,
  db: PrismaClient = prisma,
) {
  return getUserProjectOrganizationsFn(userId, projectId, db)
}

// Get all organizations with detail a user is part of
async function getUserOrganizationsWithDetailsFn(
  userId: string,
  db: PrismaClient = prisma,
): Promise<{ organizations: UserOrganizationsWithDetails[] }> {
  const result = await db.$queryRaw<
    {
      result: {
        organizations: UserOrganizationsWithDetails[]
      }
    }[]
  >`
    WITH active_organizations AS (
      SELECT o.* 
      FROM "Organization" o
      JOIN "UserOrganization" uo ON o.id = uo."organizationId"
      WHERE uo."userId" = ${userId}
        AND uo."deletedAt" IS NULL
        AND o."deletedAt" IS NULL
    ),
    active_projects AS (
      SELECT p.*
      FROM "Project" p
      JOIN "ProjectOrganization" po ON p.id = po."projectId"
      WHERE po."organizationId" IN (SELECT id FROM active_organizations)
        AND p."deletedAt" IS NULL
        AND po."deletedAt" IS NULL
    ),
    organization_teams AS (
      SELECT 
        t."organizationId",
        jsonb_agg(
          to_jsonb(t.*) || jsonb_build_object('user', to_jsonb(u.*))
        ) as team_data
      FROM "UserOrganization" t
      JOIN "User" u ON t."userId" = u.id
      WHERE t."organizationId" IN (SELECT id FROM active_organizations)
        AND t."deletedAt" IS NULL
      GROUP BY t."organizationId"
    ),
    project_teams AS (
      SELECT 
        pt."projectId",
        jsonb_agg(
          jsonb_build_object(
            'id', pt.id,
            'userId', pt."userId",
            'projectId', pt."projectId",
            'user', to_jsonb(pu.*)
          )
        ) as team_data
      FROM "UserProjects" pt
      JOIN "User" pu ON pt."userId" = pu.id
      WHERE pt."projectId" IN (SELECT id FROM active_projects)
        AND pt."deletedAt" IS NULL
      GROUP BY pt."projectId"
    ),
    project_details AS (
      SELECT 
        p.id as project_id,
        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'description', p.description,
          'thumbnailUrl', p."thumbnailUrl",
          'team', COALESCE(pt.team_data, '[]'),
          'repos', COALESCE((
            SELECT jsonb_agg(to_jsonb(r.*))
            FROM "ProjectRepository" r
            WHERE r."projectId" = p.id
          ), '[]'),
          'contracts', COALESCE((
            SELECT jsonb_agg(to_jsonb(c.*))
            FROM "ProjectContract" c
            WHERE c."projectId" = p.id
          ), '[]'),
          'funding', COALESCE((
            SELECT jsonb_agg(to_jsonb(f.*))
            FROM "ProjectFunding" f
            WHERE f."projectId" = p.id
          ), '[]'),
          'snapshots', COALESCE((
            SELECT jsonb_agg(to_jsonb(s.*))
            FROM "ProjectSnapshot" s
            WHERE s."projectId" = p.id
          ), '[]'),
          'applications', COALESCE((
            SELECT jsonb_agg(to_jsonb(a.*))
            FROM "Application" a
            WHERE a."projectId" = p.id
          ), '[]'),
          'rewards', COALESCE((
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', r.id,
                'claim', to_jsonb(c.*)
              )
            )
            FROM "FundingReward" r
            LEFT JOIN "RewardClaim" c ON r.id = c."rewardId"
            WHERE r."projectId" = p.id
          ), '[]')
        ) as project_data
      FROM active_projects p
      LEFT JOIN project_teams pt ON pt."projectId" = p.id
    ),
    organization_projects AS (
      SELECT 
        po."organizationId",
        jsonb_agg(
          to_jsonb(po.*) || jsonb_build_object('project', pd.project_data)
        ) as project_data
      FROM "ProjectOrganization" po
      JOIN project_details pd ON pd.project_id = po."projectId"
      WHERE po."organizationId" IN (SELECT id FROM active_organizations)
        AND po."deletedAt" IS NULL
      GROUP BY po."organizationId"
    )
    SELECT jsonb_build_object(
      'organizations', COALESCE(
        (
          SELECT jsonb_agg(
            to_jsonb(uo.*) || jsonb_build_object(
              'organization', 
              to_jsonb(o.*) || 
              jsonb_build_object(
                'team', COALESCE(ot.team_data, '[]'),
                'projects', COALESCE(op.project_data, '[]')
              )
            )
          )
          FROM "UserOrganization" uo
          JOIN active_organizations o ON o.id = uo."organizationId"
          LEFT JOIN organization_teams ot ON ot."organizationId" = o.id
          LEFT JOIN organization_projects op ON op."organizationId" = o.id
          WHERE uo."userId" = ${userId}
            AND uo."deletedAt" IS NULL
        ),
        '[]'::jsonb
      )
    ) as result
  `

  return result[0]?.result || { organizations: [] }
}

export const getUserOrganizationsWithDetails = cache((userId: string) =>
  getUserOrganizationsWithDetailsFn(userId, prisma),
)

export async function getUserOrganizationsWithDetailsWithClient(
  userId: string,
  db: PrismaClient = prisma,
) {
  return getUserOrganizationsWithDetailsFn(userId, db)
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

export async function createOrganization(
  {
    organizationId,
    organization,
    teamMembers,
  }: {
    organizationId: string
    organization: CreateOrganizationParams
    teamMembers: CreateTeamMemberParams[]
  },
  db: PrismaClient = prisma,
) {
  // Start a transaction to ensure atomicity
  return db.organization.create({
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

export async function updateOrganization(
  {
    id,
    organization,
  }: {
    id: string
    organization: UpdateOrganizationParams
  },
  db: PrismaClient = prisma,
) {
  return db.organization.update({
    where: { id },
    data: {
      ...organization,
      updatedAt: new Date(),
    },
  })
}

// Soft delete an organization
export async function deleteOrganization(
  {
    organizationId,
  }: {
    organizationId: string
  },
  db: PrismaClient = prisma,
) {
  return db.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}

// Get detailed information about an organization
async function getOrganizationFn(
  { id }: { id: string },
  db: PrismaClient = prisma,
) {
  return db.organization.findUnique({
    where: { id },
    include: {
      team: { where: { deletedAt: null }, include: { user: true } },
      projects: true,
      OrganizationKYCTeams: {
        where: { deletedAt: null },
        select: { id: true },
      },
    },
  })
}

export const getOrganization = cache((params: { id: string }) =>
  getOrganizationFn(params, prisma),
)

export async function getOrganizationWithClient(
  params: { id: string },
  db: PrismaClient = prisma,
) {
  return getOrganizationFn(params, db)
}

async function getOrganizationWithDetailsFn(
  { id }: { id: string },
  db: PrismaClient = prisma,
) {
  const result = await db.$queryRaw<
    {
      result: Prisma.OrganizationGetPayload<{
        include: {
          team: {
            include: {
              user: true
            }
          }
          projects: {
            include: {
              project: {
                include: {
                  funding: true
                  snapshots: true
                  applications: true
                  links: true
                  rewards: {
                    include: {
                      claim: true
                    }
                  }
                }
              }
            }
          }
        }
      }>
    }[]
  >`
    WITH active_projects AS (
      SELECT p.*
      FROM "Project" p
      JOIN "ProjectOrganization" po ON p.id = po."projectId"
      WHERE po."organizationId" = ${id}
        AND p."deletedAt" IS NULL
        AND po."deletedAt" IS NULL
    ),
    project_details AS (
      SELECT 
        p.id as project_id,
        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'description', p.description,
          'funding', COALESCE((
            SELECT jsonb_agg(to_jsonb(f.*))
            FROM "ProjectFunding" f
            WHERE f."projectId" = p.id
          ), '[]'),
          'snapshots', COALESCE((
            SELECT jsonb_agg(to_jsonb(s.*))
            FROM "ProjectSnapshot" s
            WHERE s."projectId" = p.id
          ), '[]'),
          'applications', COALESCE((
            SELECT jsonb_agg(to_jsonb(a.*))
            FROM "Application" a
            WHERE a."projectId" = p.id
          ), '[]'),
          'links', COALESCE((
            SELECT jsonb_agg(to_jsonb(l.*))
            FROM "ProjectLinks" l
            WHERE l."projectId" = p.id
          ), '[]'),
          'rewards', COALESCE((
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', r.id,
                'claim', to_jsonb(c.*)
              )
            )
            FROM "FundingReward" r
            LEFT JOIN "RewardClaim" c ON r.id = c."rewardId"
            WHERE r."projectId" = p.id
          ), '[]')
        ) as project_data
      FROM active_projects p
    )
    SELECT 
      to_jsonb(o.*) || 
      jsonb_build_object(
        'team', COALESCE((
          SELECT jsonb_agg(
            to_jsonb(t.*) || 
            jsonb_build_object('user', to_jsonb(u.*))
          )
          FROM "UserOrganization" t
          JOIN "User" u ON t."userId" = u.id
          WHERE t."organizationId" = o.id
            AND t."deletedAt" IS NULL
        ), '[]'),
        'projects', COALESCE((
          SELECT jsonb_agg(
            to_jsonb(po.*) || 
            jsonb_build_object('project', pd.project_data)
          )
          FROM "ProjectOrganization" po
          JOIN project_details pd ON pd.project_id = po."projectId"
          WHERE po."organizationId" = o.id
            AND po."deletedAt" IS NULL
        ), '[]')
      ) as result
    FROM "Organization" o
    WHERE o.id = ${id}
      AND o."deletedAt" IS NULL
  `

  return result[0]?.result || { organization: null }
}

export const getOrganizationWithDetails = cache((params: { id: string }) =>
  getOrganizationWithDetailsFn(params, prisma),
)

export async function getOrganizationWithDetailsWithClient(
  params: { id: string },
  db: PrismaClient = prisma,
) {
  return getOrganizationWithDetailsFn(params, db)
}

export async function addOrganizationSnapshot(
  {
    organizationId,
    ipfsHash,
    attestationId,
  }: {
    organizationId: string
    ipfsHash: string
    attestationId: string
  },
  db: PrismaClient = prisma,
) {
  return db.organizationSnapshot.create({
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
export async function addOrganizationMembers(
  {
    organizationId,
    userIds,
    role = "member",
  }: {
    organizationId: string
    userIds: string[]
    role?: string
  },
  db: PrismaClient = prisma,
) {
  return db.userOrganization.createMany({
    data: userIds.map((userId) => ({
      organizationId,
      userId,
      role,
    })),
  })
}

// Update a member's role within an organization
export async function updateOrganizationMemberRole(
  {
    organizationId,
    userId,
    role,
  }: {
    organizationId: string
    userId: string
    role: string
  },
  db: PrismaClient = prisma,
) {
  return db.userOrganization.update({
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
export async function removeOrganizationMember(
  {
    organizationId,
    userId,
  }: {
    organizationId: string
    userId: string
  },
  db: PrismaClient = prisma,
) {
  return db.userOrganization.delete({
    where: {
      userId_organizationId: {
        organizationId,
        userId,
      },
    },
  })
}

// Get organization contributors
async function getOrganizationTeamFn(
  { id }: { id: string },
  db: PrismaClient = prisma,
) {
  return db.organization.findUnique({
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

export const getOrganizationTeam = cache((params: { id: string }) =>
  getOrganizationTeamFn(params, prisma),
)

export async function getOrganizationTeamWithClient(
  params: { id: string },
  db: PrismaClient = prisma,
) {
  return getOrganizationTeamFn(params, db)
}

//  Checks if a user is an admin of an organization
export async function isUserAdminOfOrganization(
  userId: string,
  organizationId: string,
  db: PrismaClient = prisma,
) {
  const userOrganization = await db.userOrganization.findFirst({
    where: {
      userId,
      organizationId,
      role: "admin",
      deletedAt: null,
    },
  })

  return userOrganization !== null
}

export async function createOrganizationKycTeam(
  {
    walletAddress,
    organizationId,
  }: {
    walletAddress: string
    organizationId: string
  },
  db: PrismaClient = prisma,
) {
  try {
    const normalizedAddress = walletAddress.toLowerCase()

    const [orgProjects, orgProjectWithDeletedKycTeam] = await Promise.all([
      db.projectOrganization.findMany({
        where: {
          AND: [
            {
              organization: {
                id: {
                  equals: organizationId,
                },
              },
            },
            {
              project: {
                kycTeamId: null,
              },
            },
          ],
        },
        select: {
          projectId: true,
        },
      }),
      db.projectOrganization.findMany({
        where: {
          organizationId,
          project: {
            kycTeam: {
              deletedAt: {
                not: null,
              },
              rewardStreams: {
                some: {},
              },
            },
          },
        },
        select: {
          project: {
            select: {
              id: true,
              kycTeam: {
                select: {
                  id: true,
                  rewardStreams: true,
                },
                where: {
                  deletedAt: {
                    not: null,
                  },
                },
              },
            },
          },
        },
      }),
    ])

    let createdKycTeam: { id: string; walletAddress: string }

    if (orgProjectWithDeletedKycTeam.length > 0) {
      createdKycTeam = await db.$transaction(async (tx) => {
        // Check if there's a soft-deleted KYCTeam with the same wallet address.
        // This handles the case where a user "starts over" but wants to reuse the same address
        const existingSoftDeletedTeam = await tx.kYCTeam.findFirst({
          where: {
            walletAddress: normalizedAddress,
            deletedAt: { not: null },
          },
          select: { id: true },
        })

        // If found, free up the wallet address by setting a placeholder.
        // Note: Due to ON UPDATE CASCADE on SuperfluidStream.receiver FK,
        // changing walletAddress will cascade to SuperfluidStream - we fix this below.
        const placeholderAddress = existingSoftDeletedTeam
          ? `_deleted_${existingSoftDeletedTeam.id}`
          : null

        if (existingSoftDeletedTeam) {
          await tx.kYCTeam.update({
            where: { id: existingSoftDeletedTeam.id },
            data: {
              walletAddress: placeholderAddress!,
            },
          })
        }

        const kycTeam = await tx.kYCTeam.create({
          data: {
            walletAddress: normalizedAddress,
          },
        })

        // Fix SuperfluidStream.receiver values that were cascaded to the placeholder.
        if (placeholderAddress) {
          await tx.superfluidStream.updateMany({
            where: {
              receiver: placeholderAddress,
            },
            data: {
              receiver: normalizedAddress,
            },
          })
        }

        await Promise.all([
          // Connect all reward streams to the new kyc team
          tx.rewardStream.updateMany({
            where: {
              id: {
                in:
                  orgProjectWithDeletedKycTeam.flatMap(
                    (project) =>
                      project.project.kycTeam?.rewardStreams.map(
                        (stream) => stream.id,
                      ) ?? [],
                  ) ?? [],
              },
            },
            data: {
              kycTeamId: kycTeam.id,
            },
          }),

          // Connect all projects to the new kyc team
          tx.project.updateMany({
            where: {
              id: {
                in: orgProjectWithDeletedKycTeam.map(
                  (project) => project.project.id,
                ),
              },
            },
            data: {
              kycTeamId: kycTeam.id,
            },
          }),

          // Create kyc team & organization relationship
          tx.organizationKYCTeam.create({
            data: {
              organizationId,
              kycTeamId: kycTeam.id,
            },
          }),
        ])

        return kycTeam
      })
    } else {
      createdKycTeam = await db.$transaction(async (tx) => {
        // Check if there's a soft-deleted KYCTeam with the same wallet address.
        // This handles the case where a user "starts over" but wants to reuse the same address
        // (e.g., updating signers on a multisig without changing the address).
        const existingSoftDeletedTeam = await tx.kYCTeam.findFirst({
          where: {
            walletAddress: normalizedAddress,
            deletedAt: { not: null },
          },
          select: { id: true },
        })

        // If found, free up the wallet address by setting a placeholder.
        // Note: Due to ON UPDATE CASCADE on SuperfluidStream.receiver FK,
        // changing walletAddress will cascade to SuperfluidStream - we fix this below.
        const placeholderAddress = existingSoftDeletedTeam
          ? `_deleted_${existingSoftDeletedTeam.id}`
          : null

        if (existingSoftDeletedTeam) {
          await tx.kYCTeam.update({
            where: { id: existingSoftDeletedTeam.id },
            data: {
              walletAddress: placeholderAddress!,
            },
          })
        }

        const kycTeam = await tx.kYCTeam.create({
          data: {
            walletAddress: normalizedAddress,
          },
        })

        // Fix SuperfluidStream.receiver values that were cascaded to the placeholder.
        if (placeholderAddress) {
          await tx.superfluidStream.updateMany({
            where: {
              receiver: placeholderAddress,
            },
            data: {
              receiver: normalizedAddress,
            },
          })
        }

        await Promise.all([
          // Connect all projects to the new kyc team
          tx.project.updateMany({
            where: {
              id: { in: orgProjects.map((project) => project.projectId) },
            },
            data: {
              kycTeamId: kycTeam.id,
            },
          }),

          // Create kyc team & organization relationship
          tx.organizationKYCTeam.create({
            data: {
              organizationId,
              kycTeamId: kycTeam.id,
            },
          }),
        ])

        return kycTeam
      })
    }

    return {
      id: createdKycTeam.id,
      walletAddress: createdKycTeam.walletAddress,
      error: null,
    }
  } catch (error: any) {
    if (error.message.includes("Unique constraint failed")) {
      return { error: "KYC team with this Wallet Address already exists" }
    }

    return { error: error.message }
  }
}

export async function getOrganizationKYCTeams(
  {
    organizationId,
  }: {
    organizationId: string
  },
  db: PrismaClient = prisma,
) {
  return db.organizationKYCTeam.findMany({
    where: { organizationId, team: { deletedAt: null } },
    include: {
      team: {
        include: {
          team: { include: { users: true } },
          KYCLegalEntityTeams: {
            include: {
              legalEntity: {
                include: {
                  kycLegalEntityController: true,
                },
              },
            },
          },
          projects: {
            include: {
              blacklist: true,
            },
          },
          rewardStreams: true,
        },
      },
    },
  })
}
