"use server"

import { Prisma, Project } from "@prisma/client"
import { cache } from "react"

import {
  ApplicationWithDetails,
  ProjectWithDetailsLite,
  PublishedUserProjectsResult,
  TeamRole,
  UserProjectsWithDetails,
  UserProjectWithDetails,
  UserWithProjects,
} from "@/lib/types"
import { ProjectMetadata } from "@/lib/utils/metadata"

import { prisma } from "./client"

async function getUserProjectsFn({ farcasterId }: { farcasterId: string }) {
  const result = await prisma.$queryRaw<{ result: UserWithProjects }[]>`
    SELECT jsonb_build_object(
      'id', u.id,
      'projects', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'projectId', up."projectId",
              'userId', up."userId",
              'deletedAt', up."deletedAt",
              'project', to_jsonb(p.*)
            )
          )
          FROM "Project" p
          JOIN "UserProjects" up ON p."id" = up."projectId"
          WHERE up."userId" = u.id
            AND up."deletedAt" IS NULL
            AND p."deletedAt" IS NULL
        ),
        '[]'::jsonb
      )
    ) as result
    FROM "User" u
    WHERE u."farcasterId" = ${farcasterId}
    LIMIT 1;
  `

  return result[0]?.result
}

export const getUserProjects = cache(getUserProjectsFn)

async function getUserAdminProjectsWithDetailFn({
  userId,
  roundId,
}: {
  userId: string
  roundId?: string
}): Promise<UserProjectsWithDetails | null> {
  const result = await prisma.$queryRaw<{ result: UserProjectsWithDetails }[]>`
    WITH user_projects AS (
      SELECT 
        p.*,
        COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
          'id', t."id",
          'role', t."role",
          'userId', t."userId",
          'projectId', t."projectId",
          'deletedAt', t."deletedAt",
          'user', to_jsonb(u.*)
        )) FILTER (WHERE t."id" IS NOT NULL), '[]'::jsonb) as "team",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(r.*)) FILTER (WHERE r."id" IS NOT NULL), '[]'::jsonb) as "repos",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(c.*)) FILTER (WHERE c."id" IS NOT NULL), '[]'::jsonb) as "contracts",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(f.*)) FILTER (WHERE f."id" IS NOT NULL), '[]'::jsonb) as "funding",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(s.*)) FILTER (WHERE s."id" IS NOT NULL), '[]'::jsonb) as "snapshots",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(l.*)) FILTER (WHERE l."id" IS NOT NULL), '[]'::jsonb) as "links",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(a.*)) FILTER (WHERE a."id" IS NOT NULL), '[]'::jsonb) as "applications",
        COALESCE(jsonb_agg(
          DISTINCT jsonb_build_object(
            'id', fr."id",
            'roundId', fr."roundId",
            'projectId', fr."projectId",
            'amount', fr."amount",
            'createdAt', fr."createdAt",
            'updatedAt', fr."updatedAt",
            'claim', to_jsonb(rc.*)
          )
        ) FILTER (WHERE fr."id" IS NOT NULL), '[]'::jsonb) as "rewards",
        po."organizationId",
        o."name" as "organization_name",
        COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
          'id', ot."id",
          'role', ot."role",
          'userId', ot."userId",
          'organizationId', ot."organizationId",
          'deletedAt', ot."deletedAt",
          'user', to_jsonb(ou.*)
        )) FILTER (WHERE ot."id" IS NOT NULL), '[]'::jsonb) as "organization_team"
      FROM "Project" p
      LEFT JOIN "UserProjects" up ON p."id" = up."projectId" AND up."deletedAt" IS NULL
      LEFT JOIN "UserProjects" t ON p."id" = t."projectId" AND t."deletedAt" IS NULL
      LEFT JOIN "User" u ON t."userId" = u."id"
      LEFT JOIN "ProjectRepository" r ON p."id" = r."projectId"
      LEFT JOIN "ProjectContract" c ON p."id" = c."projectId"
      LEFT JOIN "ProjectFunding" f ON p."id" = f."projectId"
      LEFT JOIN "ProjectSnapshot" s ON p."id" = s."projectId"
      LEFT JOIN "ProjectLinks" l ON p."id" = l."projectId"
      LEFT JOIN "Application" a ON p."id" = a."projectId" 
        AND (${roundId}::text IS NULL OR a."roundId" = ${roundId}::text)
      LEFT JOIN "FundingReward" fr ON p."id" = fr."projectId"
      LEFT JOIN "RewardClaim" rc ON fr."id" = rc."rewardId"
      LEFT JOIN "ProjectOrganization" po ON p."id" = po."projectId" AND po."deletedAt" IS NULL
      LEFT JOIN "Organization" o ON po."organizationId" = o."id" AND o."deletedAt" IS NULL
      LEFT JOIN "UserOrganization" ot ON o."id" = ot."organizationId" AND ot."deletedAt" IS NULL
      LEFT JOIN "User" ou ON ot."userId" = ou."id"
      WHERE up."userId" = ${userId}
        AND up."role" = 'admin'
        AND p."deletedAt" IS NULL
      GROUP BY p."id", po."organizationId", o."name"
    ),
    org_projects AS (
      SELECT 
        p.*,
        COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
          'id', t."id",
          'role', t."role",
          'userId', t."userId",
          'projectId', t."projectId",
          'deletedAt', t."deletedAt",
          'user', to_jsonb(u.*)
        )) FILTER (WHERE t."id" IS NOT NULL), '[]'::jsonb) as "team",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(r.*)) FILTER (WHERE r."id" IS NOT NULL), '[]'::jsonb) as "repos",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(c.*)) FILTER (WHERE c."id" IS NOT NULL), '[]'::jsonb) as "contracts",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(f.*)) FILTER (WHERE f."id" IS NOT NULL), '[]'::jsonb) as "funding",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(s.*)) FILTER (WHERE s."id" IS NOT NULL), '[]'::jsonb) as "snapshots",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(l.*)) FILTER (WHERE l."id" IS NOT NULL), '[]'::jsonb) as "links",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(a.*)) FILTER (WHERE a."id" IS NOT NULL), '[]'::jsonb) as "applications",
        COALESCE(jsonb_agg(
          DISTINCT jsonb_build_object(
            'id', fr."id",
            'roundId', fr."roundId",
            'projectId', fr."projectId",
            'amount', fr."amount",
            'createdAt', fr."createdAt",
            'updatedAt', fr."updatedAt",
            'claim', to_jsonb(rc.*)
          )
        ) FILTER (WHERE fr."id" IS NOT NULL), '[]'::jsonb) as "rewards",
        o."id" as "organization_id",
        o."name" as "organization_name"
      FROM "Project" p
      JOIN "ProjectOrganization" po ON p."id" = po."projectId" AND po."deletedAt" IS NULL
      JOIN "Organization" o ON po."organizationId" = o."id" AND o."deletedAt" IS NULL
      JOIN "UserOrganization" uo ON o."id" = uo."organizationId" 
        AND uo."userId" = ${userId}
        AND uo."role" = 'admin'
        AND uo."deletedAt" IS NULL
      LEFT JOIN "UserProjects" t ON p."id" = t."projectId" AND t."deletedAt" IS NULL
      LEFT JOIN "User" u ON t."userId" = u."id"
      LEFT JOIN "ProjectRepository" r ON p."id" = r."projectId"
      LEFT JOIN "ProjectContract" c ON p."id" = c."projectId"
      LEFT JOIN "ProjectFunding" f ON p."id" = f."projectId"
      LEFT JOIN "ProjectSnapshot" s ON p."id" = s."projectId"
      LEFT JOIN "ProjectLinks" l ON p."id" = l."projectId"
      LEFT JOIN "Application" a ON p."id" = a."projectId"
        AND (${roundId}::text IS NULL OR a."roundId" = ${roundId}::text)
      LEFT JOIN "FundingReward" fr ON p."id" = fr."projectId"
      LEFT JOIN "RewardClaim" rc ON fr."id" = rc."rewardId"
      WHERE p."deletedAt" IS NULL
      GROUP BY p."id", o."id", o."name"
    ),
    org_projects_grouped AS (
      SELECT 
        "organization_id",
        "organization_name",
        jsonb_agg(
          jsonb_build_object(
            'project', to_jsonb(op.*)
          )
        ) as projects
      FROM org_projects op
      GROUP BY "organization_id", "organization_name"
    )
    SELECT jsonb_build_object(
      'projects', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'project', to_jsonb(up.*) - 'organization_id' - 'organization_name' - 'organization_team' ||
            CASE 
              WHEN up."organizationId" IS NOT NULL THEN jsonb_build_object(
                'organization', jsonb_build_object(
                  'id', up."organizationId",
                  'name', up."organization_name",
                  'team', up."organization_team"
                )
              )
              ELSE '{}'::jsonb
            END
          )
        )
        FROM user_projects up),
        '[]'::jsonb
      ),
      'organizations', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'organization', jsonb_build_object(
              'id', og."organization_id",
              'name', og."organization_name",
              'projects', og.projects
            )
          )
        )
        FROM org_projects_grouped og),
        '[]'::jsonb
      )
    ) as result;
  `

  return result[0]?.result
}

export const getUserAdminProjectsWithDetail = cache(
  getUserAdminProjectsWithDetailFn,
)

const getRandomProjectsFn = () => {
  return prisma.$queryRaw<Project[]>`
    SELECT * 
    FROM "Project" 
    WHERE "deletedAt" IS NULL 
    AND "thumbnailUrl" IS NOT NULL 
    AND "thumbnailUrl" != ''
    ORDER BY RANDOM() 
    LIMIT 5;
  `
}

export const getRandomProjects = cache(getRandomProjectsFn)

async function getUserProjectsWithDetailsFn({ userId }: { userId: string }) {
  const result = await prisma.$queryRaw<
    { result: { projects: { project: UserProjectWithDetails }[] } }[]
  >`
    WITH project_data AS (
      SELECT 
        p.*,
        COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
          'id', t."id",
          'role', t."role",
          'userId', t."userId",
          'projectId', t."projectId",
          'deletedAt', t."deletedAt",
          'user', to_jsonb(u.*)
        )) FILTER (WHERE t."id" IS NOT NULL), '[]'::jsonb) as "team",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(r.*)) FILTER (WHERE r."id" IS NOT NULL), '[]'::jsonb) as "repos",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(c.*)) FILTER (WHERE c."id" IS NOT NULL), '[]'::jsonb) as "contracts",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(f.*)) FILTER (WHERE f."id" IS NOT NULL), '[]'::jsonb) as "funding",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(s.*)) FILTER (WHERE s."id" IS NOT NULL), '[]'::jsonb) as "snapshots",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(l.*)) FILTER (WHERE l."id" IS NOT NULL), '[]'::jsonb) as "links",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(a.*)) FILTER (WHERE a."id" IS NOT NULL), '[]'::jsonb) as "applications",
        COALESCE(jsonb_agg(
          DISTINCT jsonb_build_object(
            'id', fr."id",
            'roundId', fr."roundId",
            'projectId', fr."projectId",
            'amount', fr."amount",
            'createdAt', fr."createdAt",
            'updatedAt', fr."updatedAt",
            'claim', to_jsonb(rc.*)
          )
        ) FILTER (WHERE fr."id" IS NOT NULL), '[]'::jsonb) as "rewards",
        po."organizationId",
        CASE 
          WHEN po."id" IS NOT NULL THEN jsonb_build_object(
            'organization', jsonb_build_object(
              'team', COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
                'id', ot."id",
                'role', ot."role",
                'userId', ot."userId",
                'organizationId', ot."organizationId",
                'deletedAt', ot."deletedAt",
                'user', to_jsonb(ou.*)
              )) FILTER (WHERE ot."id" IS NOT NULL), '[]'::jsonb)
            )
          )
          ELSE NULL
        END as "organization"
      FROM "Project" p
      JOIN "UserProjects" up ON p."id" = up."projectId" 
        AND up."userId" = ${userId}
        AND up."deletedAt" IS NULL
      LEFT JOIN "UserProjects" t ON p."id" = t."projectId" 
        AND t."deletedAt" IS NULL
      LEFT JOIN "User" u ON t."userId" = u."id"
      LEFT JOIN "ProjectRepository" r ON p."id" = r."projectId"
      LEFT JOIN "ProjectContract" c ON p."id" = c."projectId"
      LEFT JOIN "ProjectFunding" f ON p."id" = f."projectId"
      LEFT JOIN "ProjectSnapshot" s ON p."id" = s."projectId"
      LEFT JOIN "ProjectLinks" l ON p."id" = l."projectId"
      LEFT JOIN "Application" a ON p."id" = a."projectId"
      LEFT JOIN "FundingReward" fr ON p."id" = fr."projectId"
      LEFT JOIN "RewardClaim" rc ON fr."id" = rc."rewardId"
      LEFT JOIN "ProjectOrganization" po ON p."id" = po."projectId" 
        AND po."deletedAt" IS NULL
      LEFT JOIN "Organization" o ON po."organizationId" = o."id" 
        AND o."deletedAt" IS NULL
      LEFT JOIN "UserOrganization" ot ON o."id" = ot."organizationId" 
        AND ot."deletedAt" IS NULL
      LEFT JOIN "User" ou ON ot."userId" = ou."id"
      WHERE p."deletedAt" IS NULL
        AND (po."id" IS NULL)
      GROUP BY p."id", po."id", po."organizationId"
      ORDER BY p."createdAt" ASC
    )
    SELECT jsonb_build_object(
      'projects', COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'project', to_jsonb(pd.*) - 'organizationId'
          )
        ),
        '[]'::jsonb
      )
    ) as result
    FROM project_data pd;
  `

  return result[0]?.result
}

export const getUserProjectsWithDetails = cache(getUserProjectsWithDetailsFn)

async function getAllPublishedUserProjectsFn({
  userId,
}: {
  userId: string
}): Promise<PublishedUserProjectsResult> {
  const result = await prisma.$queryRaw<
    [{ result: PublishedUserProjectsResult }]
  >`
    WITH "user_projects" AS (
      SELECT 
        p.*,
        COALESCE(json_agg(DISTINCT pf.*) FILTER (WHERE pf."id" IS NOT NULL), '[]') as "funding",
        COALESCE(json_agg(DISTINCT ps.*) FILTER (WHERE ps."id" IS NOT NULL), '[]') as "snapshots",
        COALESCE(json_agg(DISTINCT a.*) FILTER (WHERE a."id" IS NOT NULL), '[]') as "applications",
        COALESCE(json_agg(DISTINCT pl.*) FILTER (WHERE pl."id" IS NOT NULL), '[]') as "links",
        COALESCE(json_agg(
          DISTINCT jsonb_build_object(
            'id', fr."id",
            'roundId', fr."roundId",
            'projectId', fr."projectId",
            'amount', fr."amount",
            'createdAt', fr."createdAt",
            'updatedAt', fr."updatedAt",
            'claim', rc
          )
        ) FILTER (WHERE fr."id" IS NOT NULL), '[]') as "rewards"
      FROM "Project" p
      LEFT JOIN "UserProjects" up ON p."id" = up."projectId" 
        AND up."deletedAt" IS NULL
      LEFT JOIN "ProjectFunding" pf ON p."id" = pf."projectId"
      LEFT JOIN "ProjectSnapshot" ps ON p."id" = ps."projectId"
      LEFT JOIN "Application" a ON p."id" = a."projectId"
      LEFT JOIN "ProjectLinks" pl ON p."id" = pl."projectId"
      LEFT JOIN "FundingReward" fr ON p."id" = fr."projectId"
      LEFT JOIN "RewardClaim" rc ON fr."id" = rc."rewardId"
      WHERE up."userId" = ${userId}
        AND p."deletedAt" IS NULL
        AND p."id" NOT IN (SELECT "projectId" FROM "ProjectOrganization")
      GROUP BY p."id"
    ),
    "org_projects" AS (
      SELECT 
        p.*,
        COALESCE(json_agg(DISTINCT pf.*) FILTER (WHERE pf."id" IS NOT NULL), '[]') as "funding",
        COALESCE(json_agg(DISTINCT ps.*) FILTER (WHERE ps."id" IS NOT NULL), '[]') as "snapshots",
        COALESCE(json_agg(DISTINCT a.*) FILTER (WHERE a."id" IS NOT NULL), '[]') as "applications",
        COALESCE(json_agg(DISTINCT pl.*) FILTER (WHERE pl."id" IS NOT NULL), '[]') as "links",
        COALESCE(json_agg(
          DISTINCT jsonb_build_object(
            'id', fr."id",
            'roundId', fr."roundId",
            'projectId', fr."projectId",
            'amount', fr."amount",
            'createdAt', fr."createdAt",
            'updatedAt', fr."updatedAt",
            'claim', rc
          )
        ) FILTER (WHERE fr."id" IS NOT NULL), '[]') as "rewards",
        o."id" as "organization_id",
        o."name" as "organization_name"
      FROM "Project" p
      JOIN "ProjectOrganization" po ON p."id" = po."projectId" 
        AND po."deletedAt" IS NULL
      JOIN "Organization" o ON po."organizationId" = o."id" 
        AND o."deletedAt" IS NULL
      JOIN "UserOrganization" uo ON o."id" = uo."organizationId" 
        AND uo."userId" = ${userId}
        AND uo."deletedAt" IS NULL
      LEFT JOIN "ProjectFunding" pf ON p."id" = pf."projectId"
      LEFT JOIN "ProjectSnapshot" ps ON p."id" = ps."projectId"
      LEFT JOIN "Application" a ON p."id" = a."projectId"
      LEFT JOIN "ProjectLinks" pl ON p."id" = pl."projectId"
      LEFT JOIN "FundingReward" fr ON p."id" = fr."projectId"
      LEFT JOIN "RewardClaim" rc ON fr."id" = rc."rewardId"
      WHERE p."deletedAt" IS NULL
      GROUP BY p."id", o."id", o."name"
    ),
    "org_projects_grouped" AS (
      SELECT 
        "organization_id",
        "organization_name",
        jsonb_agg(
          jsonb_build_object(
            'project', jsonb_build_object(
              'id', "id",
              'name', "name",
              'description', "description",
              'category', "category",
              'thumbnailUrl', "thumbnailUrl",
              'bannerUrl', "bannerUrl",
              'website', "website",
              'farcaster', "farcaster",
              'twitter', "twitter",
              'mirror', "mirror",
              'pricingModel', "pricingModel",
              'pricingModelDetails', "pricingModelDetails",
              'openSourceObserverSlug', "openSourceObserverSlug",
              'addedTeamMembers', "addedTeamMembers",
              'addedFunding', "addedFunding",
              'hasCodeRepositories', "hasCodeRepositories",
              'isOnChainContract', "isOnChainContract",
              'lastMetadataUpdate', "lastMetadataUpdate",
              'createdAt', "createdAt",
              'updatedAt', "updatedAt",
              'deletedAt', "deletedAt",
              'funding', "funding",
              'snapshots', "snapshots",
              'applications', "applications",
              'links', "links",
              'rewards', "rewards"
            )
          )
        ) as projects
      FROM "org_projects"
      GROUP BY "organization_id", "organization_name"
    )
    SELECT jsonb_build_object(
      'projects', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'project', to_jsonb(up.*) - 'organization_id' - 'organization_name'
          )
        )
        FROM "user_projects" up),
        '[]'::jsonb
      ),
      'organizations', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'organization', jsonb_build_object(
              'id', og."organization_id",
              'name', og."organization_name",
              'projects', og.projects
            )
          )
        )
        FROM "org_projects_grouped" og),
        '[]'::jsonb
      )
    ) as result;
  `

  // Transform the raw result to match the expected structure
  const transformed = result[0]?.result || { projects: [], organizations: [] }

  // Ensure null arrays are converted to empty arrays
  transformed.projects = transformed.projects || []
  transformed.organizations = transformed.organizations || []

  return transformed
}

export const getAllPublishedUserProjects = cache(getAllPublishedUserProjectsFn)

async function getProjectFn({ id }: { id: string }) {
  return prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      team: { where: { deletedAt: null }, include: { user: true } },
      organization: {
        where: { deletedAt: null, organization: { deletedAt: null } },
        include: {
          organization: {
            include: {
              team: {
                where: { deletedAt: null },
                include: { user: true },
              },
            },
          },
        },
      },
      repos: true,
      contracts: true,
      links: true,
      funding: true,
      snapshots: {
        orderBy: {
          createdAt: "asc",
        },
      },
      applications: {
        include: {
          category: {
            include: {
              impactStatements: true,
            },
          },
          impactStatementAnswer: true,
          round: true,
        },
      },
      rewards: { include: { claim: true } },
    },
  })
}

export const getProject = cache(getProjectFn)

async function getProjectTeamFn({ id }: { id: string }) {
  return prisma.project.findUnique({
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

export const getProjectTeam = cache(getProjectTeamFn)

async function getProjectContractsFn({
  projectId,
  deployerAddress,
}: {
  projectId: string
  deployerAddress: string
}) {
  return prisma.projectContract.findMany({
    where: {
      projectId,
      deployerAddress,
    },
    include: {
      project: true,
    },
  })
}

export const getProjectContracts = cache(getProjectContractsFn)

async function getUserApplicationsFn({
  userId,
  roundId,
}: {
  userId: string
  roundId?: string
}): Promise<ApplicationWithDetails[]> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      projects: {
        where: {
          project: {
            deletedAt: null,
          },
        },
        include: {
          project: {
            include: {
              applications: {
                include: {
                  impactStatementAnswer: {
                    include: {
                      impactStatement: true,
                    },
                  },
                  project: true,
                  round: true,
                },
                where: {
                  roundId,
                },
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          },
        },
      },
      organizations: {
        where: {
          organization: {
            deletedAt: null,
          },
        },
        include: {
          organization: {
            include: {
              projects: {
                where: {
                  project: {
                    deletedAt: null,
                  },
                },
                include: {
                  project: {
                    include: {
                      applications: {
                        include: {
                          impactStatementAnswer: true,
                          project: true,
                          round: true,
                        },
                        where: {
                          roundId,
                        },
                        orderBy: {
                          createdAt: "desc",
                        },
                      },
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

  // merge organization applications with user applications
  if (!user) return []

  const applications = [
    ...user.projects.flatMap((p) => p.project.applications),
    ...user.organizations.flatMap((o) =>
      o.organization.projects.flatMap((p) => p.project.applications),
    ),
  ]

  return applications
}

export const getUserApplications = cache(getUserApplicationsFn)

export type CreateProjectParams = Partial<
  Omit<Project, "id" | "createdAt" | "updatedAt" | "deletedAt">
> & {
  name: string
}

export async function createProject({
  userId,
  projectId,
  organizationId,
  project,
}: {
  userId: string
  projectId: string
  organizationId?: string
  project: CreateProjectParams
}) {
  return prisma.project.create({
    data: {
      id: projectId,
      ...project,
      team: {
        create: [
          {
            role: "admin" satisfies TeamRole,
            user: {
              connect: {
                id: userId,
              },
            },
          },
          ...(organizationId
            ? await prisma.userOrganization
                .findMany({
                  where: { organizationId, deletedAt: null },
                  select: { userId: true },
                })
                .then((members) =>
                  members
                    .filter((member) => member.userId !== userId)
                    .map((member) => ({
                      role: "member",

                      user: {
                        connect: {
                          id: member.userId,
                        },
                      },
                    })),
                )
            : []),
        ],
      },
      organization: organizationId
        ? {
            create: {
              organization: {
                connect: {
                  id: organizationId,
                },
              },
            },
          }
        : undefined,
    },
  })
}

export type UpdateProjectParams = Partial<
  Omit<Project, "id" | "createdAt" | "updatedAt" | "deletedAt">
>

export async function updateProject({
  id,
  project,
}: {
  id: string
  project: UpdateProjectParams
}) {
  return prisma.project.update({
    where: {
      id,
    },
    data: {
      ...project,
      lastMetadataUpdate: new Date(),
    },
  })
}

export async function updateProjectOrganization({
  projectId,
  organizationId,
}: {
  projectId: string
  organizationId: string
}) {
  return prisma.projectOrganization.upsert({
    where: { projectId },
    update: { organizationId },
    create: { projectId, organizationId },
  })
}

export async function removeProjectOrganization({
  projectId,
}: {
  projectId: string
}) {
  return prisma.projectOrganization.deleteMany({
    where: { projectId },
  })
}

export async function deleteProject({ id }: { id: string }) {
  return prisma.project.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}

export async function addTeamMembers({
  projectId,
  userIds,
  role = "member",
}: {
  projectId: string
  userIds: string[]
  role?: TeamRole
}) {
  // There may be users who were previously soft deleted, so this is complex
  const deletedMembers = await prisma.userProjects.findMany({
    where: {
      projectId,
      userId: {
        in: userIds,
      },
    },
  })

  const updateMemberIds = deletedMembers.map((m) => m.userId)
  const createMemberIds = userIds.filter((id) => !updateMemberIds.includes(id))

  const memberUpdate = prisma.userProjects.updateMany({
    where: {
      projectId,
      userId: {
        in: updateMemberIds,
      },
    },
    data: {
      deletedAt: null,
    },
  })

  const memberCreate = prisma.userProjects.createMany({
    data: createMemberIds.map((userId) => ({
      role,
      userId,
      projectId,
    })),
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([memberUpdate, memberCreate, projectUpdate])
}

export async function updateMemberRole({
  projectId,
  userId,
  role,
}: {
  projectId: string
  userId: string
  role: TeamRole
}) {
  const memberUpdate = prisma.userProjects.update({
    where: {
      userId_projectId: {
        projectId,
        userId,
      },
    },
    data: {
      role,
    },
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([memberUpdate, projectUpdate])
}

export async function removeTeamMember({
  projectId,
  userId,
}: {
  projectId: string
  userId: string
}) {
  const memberDelete = prisma.userProjects.update({
    where: {
      userId_projectId: {
        projectId,
        userId,
      },
    },
    data: {
      role: "member",
      deletedAt: new Date(),
    },
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([memberDelete, projectUpdate])
}

export async function addProjectContract({
  projectId,
  contract,
}: {
  projectId: string
  contract: Omit<Prisma.ProjectContractCreateInput, "project">
}) {
  const contractCreate = prisma.projectContract.create({
    data: {
      ...contract,
      project: {
        connect: {
          id: projectId,
        },
      },
    },
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([contractCreate, projectUpdate])
}

export async function updateProjectContract({
  projectId,
  contractAddress,
  chainId,
  updates,
}: {
  projectId: string
  contractAddress: string
  chainId: number
  updates: Prisma.ProjectContractUpdateInput
}) {
  const contractUpdate = prisma.projectContract.update({
    where: {
      projectId,
      contractAddress_chainId: {
        contractAddress,
        chainId,
      },
    },
    data: updates,
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([contractUpdate, projectUpdate])
}

export async function removeProjectContract({
  projectId,
  address,
  chainId,
}: {
  projectId: string
  address: string
  chainId: number
}) {
  const contractDelete = prisma.projectContract.delete({
    where: {
      projectId,
      contractAddress_chainId: {
        contractAddress: address,
        chainId,
      },
    },
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([contractDelete, projectUpdate])
}

export async function addProjectRepository({
  projectId,
  repo,
}: {
  projectId: string
  repo: Omit<Prisma.ProjectRepositoryCreateInput, "project">
}) {
  const repoCreate = prisma.projectRepository.upsert({
    where: {
      url: repo.url,
      projectId,
    },
    update: {
      ...repo,
      project: {
        connect: {
          id: projectId,
        },
      },
    },
    create: {
      ...repo,
      project: {
        connect: {
          id: projectId,
        },
      },
    },
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  const [repository, project] = await prisma.$transaction([
    repoCreate,
    projectUpdate,
  ])

  return repository
}

export async function removeProjectRepository({
  projectId,
  repositoryUrl,
}: {
  projectId: string
  repositoryUrl: string
}) {
  const repoDelete = prisma.projectRepository.delete({
    where: {
      projectId: projectId,
      url: repositoryUrl,
    },
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([repoDelete, projectUpdate])
}

export async function updateProjectRepository({
  projectId,
  url,
  updates,
}: {
  projectId: string
  url: string
  updates: Prisma.ProjectRepositoryUpdateInput
}) {
  const repoUpdate = prisma.projectRepository.update({
    where: {
      projectId,
      url,
    },
    data: updates,
  })

  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([repoUpdate, projectUpdate])
}

export async function updateProjectRepositories({
  projectId,
  type,
  repositories,
}: {
  projectId: string
  type: string
  repositories: Prisma.ProjectRepositoryCreateManyInput[]
}) {
  // Delete the existing repositories and replace it
  const remove = prisma.projectRepository.deleteMany({
    where: {
      projectId,
      type,
    },
  })

  const create = prisma.projectRepository.createMany({
    data: repositories.map((r) => ({
      ...r,
      projectId,
    })),
  })

  const update = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([remove, create, update])
}

export async function updateProjectLinks({
  projectId,
  links,
}: {
  projectId: string
  links: Prisma.ProjectLinksCreateManyInput[]
}) {
  // Delete the existing links and replace it
  const remove = prisma.projectLinks.deleteMany({
    where: {
      projectId,
    },
  })

  const create = prisma.projectLinks.createMany({
    data: links.map((l) => ({
      ...l,
      projectId,
    })),
  })

  const update = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return await prisma.$transaction([remove, create, update])
}

export async function updateProjectFunding({
  projectId,
  funding,
}: {
  projectId: string
  funding: Prisma.ProjectFundingCreateManyInput[]
}) {
  // Delete the existing funding and replace it
  const remove = prisma.projectFunding.deleteMany({
    where: {
      projectId,
    },
  })

  const create = prisma.projectFunding.createMany({
    data: funding.map((f) => ({
      ...f,
      projectId,
    })),
  })

  // Mark that the project was funded
  const update = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      addedFunding: true,
      lastMetadataUpdate: new Date(),
    },
  })

  return prisma.$transaction([remove, create, update])
}

export async function addProjectSnapshot({
  projectId,
  ipfsHash,
  attestationId,
}: {
  projectId: string
  ipfsHash: string
  attestationId: string
}) {
  return prisma.projectSnapshot.create({
    data: {
      ipfsHash,
      attestationId,
      project: {
        connect: {
          id: projectId,
        },
      },
    },
  })
}

export async function createApplication({
  round,
  projectId,
  attestationId,
  categoryId,
  impactStatement,
  projectDescriptionOptions,
}: {
  round: number
  projectId: string
  attestationId: string
  categoryId: string
  projectDescriptionOptions: string[]
  impactStatement: Record<string, string>
}) {
  return prisma.application.create({
    data: {
      attestationId,
      projectDescriptionOptions,
      project: {
        connect: {
          id: projectId,
        },
      },
      round: {
        connect: {
          id: round.toString(),
        },
      },
      category: {
        connect: {
          id: categoryId,
        },
      },
      impactStatementAnswer: {
        createMany: {
          data: Object.entries(impactStatement).map(
            ([impactStatementId, answer]) => ({
              impactStatementId,
              answer,
            }),
          ),
        },
      },
    },
  })
}

export async function updateAllForProject(
  project: ProjectMetadata,
  projectId: string,
) {
  // Update project
  const projectUpdate = prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      name: project.name,
      description: project.description,
      category: project.category,
      thumbnailUrl: project.projectAvatarUrl,
      bannerUrl: project.projectCoverImageUrl,
      website: project.socialLinks.website,
      twitter: project.socialLinks.twitter,
      mirror: project.socialLinks.mirror,
      farcaster: project.socialLinks.farcaster,
      openSourceObserverSlug: project.osoSlug,
      lastMetadataUpdate: new Date(),
    },
  })

  const cleanupContracts = prisma.projectContract.deleteMany({
    where: {
      projectId,
    },
  })

  const contractsCreate = prisma.projectContract.createMany({
    data: project.contracts.map((contract) => ({
      contractAddress: contract.address,
      deploymentHash: contract.deploymentTxHash,
      deployerAddress: contract.deployerAddress,
      verificationProof: contract.verificationProof ?? "",
      chainId: contract.chainId,
      projectId,
    })),
  })

  const cleanupRepositories = prisma.projectRepository.deleteMany({
    where: {
      projectId,
    },
  })

  const createRepositories = prisma.projectRepository.createMany({
    data: [
      ...project.github.map((repo) => ({
        url: repo.url,
        type: "github",
        projectId,
      })),
      ...project.packages.map((repo) => ({
        url: repo.url,
        type: "package",
        projectId,
      })),
    ],
  })

  const cleanupFunding = prisma.projectFunding.deleteMany({
    where: {
      projectId,
    },
  })

  const createFunding = prisma.projectFunding.createMany({
    data: [
      ...project.grantsAndFunding.ventureFunding.map((funding) => ({
        amount: funding.amount,
        receivedAt: funding.year,
        details: funding.details,
        type: "venture",
        projectId,
      })),
      ...project.grantsAndFunding.revenue.map((funding) => ({
        amount: funding.amount,
        receivedAt: "",
        details: funding.details,
        type: "revenue",
        projectId,
      })),
      ...project.grantsAndFunding.grants.map((funding) => ({
        amount: funding.amount,
        receivedAt: funding.date,
        details: funding.details,
        type: "grant",
        projectId,
      })),
    ],
  })

  return prisma.$transaction([
    projectUpdate,
    cleanupContracts,
    contractsCreate,
    cleanupRepositories,
    createRepositories,
    cleanupFunding,
    createFunding,
  ])
}
