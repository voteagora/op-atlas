"use server"

import {
  KYCUser,
  Prisma,
  PrismaClient,
  Project,
  ProjectContract,
  PublishedContract,
} from "@prisma/client"
import { unstable_cache } from "next/cache"
import { cache } from "react"
import { Address, getAddress } from "viem"
import type { Session } from "next-auth"

import {
  Oso_ProjectsByCollectionV1,
  Oso_ProjectsV1,
} from "@/graphql/__generated__/types"
import { sendKYBStartedEmail, sendKYCStartedEmail } from "@/lib/actions/emails"
import {
  ApplicationWithDetails,
  ProjectContracts,
  ProjectContractWithProject,
  ProjectTeam,
  ProjectWithDetails,
  ProjectWithFullDetails,
  ProjectWithReward,
  ProjectWithTeam,
  PublishedUserProjectsResult,
  TeamRole,
  UserProjectsWithDetails,
  UserWithProjects,
} from "@/lib/types"
import { chunkArray } from "@/lib/utils"
import { withChangelogTracking } from "@/lib/utils/changelog"
import { ProjectMetadata } from "@/lib/utils/metadata"

import { prisma } from "./client"

type DbContext = {
  db?: PrismaClient
  session?: Session | null
}

async function getUserProjectsFn(
  { userId }: { userId: string },
  db: PrismaClient = prisma,
) {
  const result = await db.$queryRaw<{ result: UserWithProjects }[]>`
    SELECT jsonb_build_object(
      'id', u.id,
      'projects', COALESCE(
        (
          SELECT jsonb_agg(
            to_jsonb(up.*) || 
            jsonb_build_object(
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
    WHERE u."id" = ${userId}
    LIMIT 1;
  `

  return result[0]?.result
}
export const getUserProjects = cache((params: { userId: string }) =>
  getUserProjectsFn(params),
)

export async function getUserProjectsWithClient(
  params: { userId: string },
  db: PrismaClient = prisma,
) {
  return getUserProjectsFn(params, db)
}

async function getUserAdminProjectsWithDetailFn(
  {
    userId,
    roundId,
  }: {
    userId: string
    roundId?: string
  },
  db: PrismaClient = prisma,
): Promise<UserProjectsWithDetails | null> {
  const result = await db.$queryRaw<{ result: UserProjectsWithDetails }[]>`
    WITH user_projects AS (
      SELECT 
        p.*,
        COALESCE(jsonb_agg(DISTINCT to_jsonb(t.*) || jsonb_build_object(
          'user', to_jsonb(u.*)
        )) FILTER (WHERE t."id" IS NOT NULL), '[]'::jsonb) as "team",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(s.*)) FILTER (WHERE s."id" IS NOT NULL), '[]'::jsonb) as "snapshots",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(a.*)) FILTER (WHERE a."id" IS NOT NULL), '[]'::jsonb) as "applications",
        COALESCE(jsonb_agg(
          DISTINCT to_jsonb(fr.*) || jsonb_build_object(
            'claim', to_jsonb(rc.*)
          )
        ) FILTER (WHERE fr."id" IS NOT NULL), '[]'::jsonb) as "rewards",
        CASE 
          WHEN kt."id" IS NOT NULL THEN jsonb_build_object(
            'id', kt."id",
            'walletAddress', kt."walletAddress",
            'createdAt', kt."createdAt",
            'rewardStreams', COALESCE(jsonb_agg(
              DISTINCT to_jsonb(rs.*) || jsonb_build_object(
                'round', to_jsonb(rsround.*)
              )
            ) FILTER (WHERE rs."id" IS NOT NULL), '[]'::jsonb)
          )
          ELSE NULL
        END as "kycTeam",
        CASE 
          WHEN po."organizationId" IS NOT NULL THEN jsonb_build_object(
            'organization', jsonb_build_object(
              'id', po."organizationId",
              'name', o."name",
              'team', COALESCE(jsonb_agg(DISTINCT to_jsonb(ot.*) || jsonb_build_object(
                'user', to_jsonb(ou.*)
              )) FILTER (WHERE ot."id" IS NOT NULL), '[]'::jsonb)
            )
          )
          ELSE NULL
        END as "organization",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(ot.*) || jsonb_build_object(
          'user', to_jsonb(ou.*)
        )) FILTER (WHERE ot."id" IS NOT NULL), '[]'::jsonb) as "organization_team"
      FROM "Project" p
      LEFT JOIN "UserProjects" up ON p."id" = up."projectId" AND up."deletedAt" IS NULL
      LEFT JOIN "UserProjects" t ON p."id" = t."projectId" AND t."deletedAt" IS NULL
      LEFT JOIN "User" u ON t."userId" = u."id"
      LEFT JOIN "ProjectSnapshot" s ON p."id" = s."projectId"
      LEFT JOIN "Application" a ON p."id" = a."projectId" 
        AND (${roundId}::text IS NULL OR a."roundId" = ${roundId}::text)
      LEFT JOIN "FundingReward" fr ON p."id" = fr."projectId"
      LEFT JOIN "RewardClaim" rc ON fr."id" = rc."rewardId"
      LEFT JOIN "KYCTeam" kt ON p."kycTeamId" = kt."id" AND kt."deletedAt" IS NULL
      LEFT JOIN "RewardStream" rs ON kt."id" = rs."kycTeamId"
      LEFT JOIN "FundingRound" rsround ON rs."roundId" = rsround."id"
      LEFT JOIN "ProjectOrganization" po ON p."id" = po."projectId" AND po."deletedAt" IS NULL
      LEFT JOIN "Organization" o ON po."organizationId" = o."id" AND o."deletedAt" IS NULL
      LEFT JOIN "UserOrganization" ot ON o."id" = ot."organizationId" AND ot."deletedAt" IS NULL
      LEFT JOIN "User" ou ON ot."userId" = ou."id"
      WHERE up."userId" = ${userId}
        AND up."role" = 'admin'
        AND p."deletedAt" IS NULL
      GROUP BY p."id", po."organizationId", o."name", kt."id", kt."walletAddress", kt."createdAt"
    ),
    org_projects AS (
      SELECT 
        p.*,
        COALESCE(jsonb_agg(DISTINCT to_jsonb(t.*) || jsonb_build_object(
          'user', to_jsonb(u.*)
        )) FILTER (WHERE t."id" IS NOT NULL), '[]'::jsonb) as "team",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(s.*)) FILTER (WHERE s."id" IS NOT NULL), '[]'::jsonb) as "snapshots",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(a.*)) FILTER (WHERE a."id" IS NOT NULL), '[]'::jsonb) as "applications",
        COALESCE(jsonb_agg(
          DISTINCT to_jsonb(fr.*) || jsonb_build_object(
            'claim', to_jsonb(rc.*)
          )
        ) FILTER (WHERE fr."id" IS NOT NULL), '[]'::jsonb) as "rewards",
        CASE 
          WHEN kt."id" IS NOT NULL THEN jsonb_build_object(
            'id', kt."id",
            'walletAddress', kt."walletAddress",
            'createdAt', kt."createdAt",
            'rewardStreams', COALESCE(jsonb_agg(
              DISTINCT to_jsonb(rs.*) || jsonb_build_object(
                'round', to_jsonb(rsround.*)
              )
            ) FILTER (WHERE rs."id" IS NOT NULL), '[]'::jsonb)
          )
          ELSE NULL
        END as "kycTeam",
        o."id" as "organization_id",
        o."name" as "organization_name",
        jsonb_build_object(
            'organization', jsonb_build_object(
              'id', o.id,
              'name', o."name",
              'team', COALESCE(jsonb_agg(DISTINCT to_jsonb(uo.*) || jsonb_build_object(
                'user', to_jsonb(uo.*)
              )) FILTER (WHERE uo."id" IS NOT NULL), '[]'::jsonb)
            )
        ) as "organization"
      FROM "Project" p
      JOIN "ProjectOrganization" po ON p."id" = po."projectId" AND po."deletedAt" IS NULL
      JOIN "Organization" o ON po."organizationId" = o."id" AND o."deletedAt" IS NULL
      JOIN "UserOrganization" uo ON o."id" = uo."organizationId" 
        AND uo."userId" = ${userId}
        AND uo."role" = 'admin'
        AND uo."deletedAt" IS NULL
      LEFT JOIN "UserProjects" t ON p."id" = t."projectId" AND t."deletedAt" IS NULL
      LEFT JOIN "User" u ON t."userId" = u."id"
      LEFT JOIN "ProjectSnapshot" s ON p."id" = s."projectId"
      LEFT JOIN "Application" a ON p."id" = a."projectId"
        AND (${roundId}::text IS NULL OR a."roundId" = ${roundId}::text)
      LEFT JOIN "FundingReward" fr ON p."id" = fr."projectId"
      LEFT JOIN "RewardClaim" rc ON fr."id" = rc."rewardId"
      LEFT JOIN "KYCTeam" kt ON p."kycTeamId" = kt."id" AND kt."deletedAt" IS NULL
      LEFT JOIN "RewardStream" rs ON kt."id" = rs."kycTeamId"
      LEFT JOIN "FundingRound" rsround ON rs."roundId" = rsround."id"
      WHERE p."deletedAt" IS NULL
      GROUP BY p."id", o."id", o."name", kt."id", kt."walletAddress", kt."createdAt"
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
            'project', to_jsonb(up.*)
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
  (params: { userId: string; roundId?: string }) =>
    getUserAdminProjectsWithDetailFn(params, prisma),
)

export async function getUserAdminProjectsWithDetailWithClient(
  params: { userId: string; roundId?: string },
  db: PrismaClient = prisma,
) {
  return getUserAdminProjectsWithDetailFn(params, db)
}

const getRandomProjectsFn = (db: PrismaClient) => {
  return db.$queryRaw<Project[]>`
    SELECT * 
    FROM "Project" 
    WHERE "deletedAt" IS NULL 
    AND "thumbnailUrl" IS NOT NULL 
    AND "thumbnailUrl" != ''
    ORDER BY RANDOM() 
    LIMIT 5;
  `
}

export const getRandomProjects = cache(() => getRandomProjectsFn(prisma))

export async function getRandomProjectsWithClient(
  db: PrismaClient = prisma,
): Promise<Project[]> {
  return getRandomProjectsFn(db)
}

const getWeightedRandomGrantRecipientsFn = (
  db: PrismaClient,
): Promise<ProjectWithReward[]> => {
  return db.$queryRaw<ProjectWithReward[]>`
    SELECT 
        p.id,
        p.name,
        p.description,
        p."thumbnailUrl",
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', fr.id,
              'amount', fr.amount
            )
          ) FILTER (WHERE fr.id IS NOT NULL),
          '[]'::jsonb
        ) as rewards
    FROM "Project" p
    LEFT JOIN "FundingReward" fr ON p.id = fr."projectId" AND fr."roundId"::NUMERIC > 6
    GROUP BY p.id, p.name, p.description, p."thumbnailUrl"
    HAVING SUM(fr.amount) > 20000
    ORDER BY -log(RANDOM()) / COALESCE(SUM(fr.amount), 1) ASC
    LIMIT 20;
  `
}

export const getWeightedRandomGrantRecipients = unstable_cache(
  () => getWeightedRandomGrantRecipientsFn(prisma),
  ["projects"],
  {
    revalidate: 60 * 60,
  },
)

export async function getWeightedRandomGrantRecipientsWithClient(
  db: PrismaClient = prisma,
): Promise<ProjectWithReward[]> {
  return getWeightedRandomGrantRecipientsFn(db)
}

async function getUserProjectsWithDetailsFn(
  { userId }: { userId: string },
  db: PrismaClient = prisma,
) {
  const result = await db.$queryRaw<
    { result: { projects: { project: ProjectWithDetails }[] } }[]
  >`
    WITH project_data AS (
      SELECT 
        p.*,
        COALESCE(jsonb_agg(DISTINCT to_jsonb(t.*) || 
          jsonb_build_object('user', to_jsonb(u.*))
        ) FILTER (WHERE t."id" IS NOT NULL), '[]'::jsonb) as "team",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(r.*)) FILTER (WHERE r."id" IS NOT NULL), '[]'::jsonb) as "repos",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(f.*)) FILTER (WHERE f."id" IS NOT NULL), '[]'::jsonb) as "funding",
        COALESCE((
          SELECT jsonb_agg(to_jsonb(s.*))
          FROM (
            SELECT DISTINCT ON (s2."id") s2.*
            FROM "ProjectSnapshot" s2
            WHERE s2."projectId" = p."id"
            ORDER BY s2."id", s2."createdAt" ASC
          ) s
        ), '[]'::jsonb) as "snapshots",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(l.*)) FILTER (WHERE l."id" IS NOT NULL), '[]'::jsonb) as "links",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(a.*)) FILTER (WHERE a."id" IS NOT NULL), '[]'::jsonb) as "applications",
        COALESCE(jsonb_agg(
          DISTINCT to_jsonb(fr.*) || 
          jsonb_build_object(
            'claim', to_jsonb(rc.*)
          )
        ) FILTER (WHERE fr."id" IS NOT NULL), '[]'::jsonb) as "rewards",
        po."organizationId",
        CASE 
          WHEN po."id" IS NOT NULL THEN jsonb_build_object(
            'organization', jsonb_build_object(
              'team', COALESCE(jsonb_agg(DISTINCT to_jsonb(ot.*) || 
                jsonb_build_object('user', to_jsonb(ou.*))
              ) FILTER (WHERE ot."id" IS NOT NULL), '[]'::jsonb)
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

export const getUserProjectsWithDetails = cache(
  (params: { userId: string }) => getUserProjectsWithDetailsFn(params, prisma),
)

export async function getUserProjectsWithDetailsWithClient(
  params: { userId: string },
  db: PrismaClient = prisma,
) {
  return getUserProjectsWithDetailsFn(params, db)
}

async function getAllPublishedUserProjectsFn(
  {
    userId,
  }: {
    userId: string
  },
  db: PrismaClient = prisma,
): Promise<PublishedUserProjectsResult> {
  const result = await db.$queryRaw<
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
          DISTINCT to_jsonb(fr.*) || 
          jsonb_build_object(
            'claim', to_jsonb(rc.*)
          )
        ) FILTER (WHERE fr."id" IS NOT NULL), '[]') as "rewards"
      FROM "Project" p
      JOIN "UserProjects" up ON p."id" = up."projectId" 
        AND up."deletedAt" IS NULL
        AND up."userId" = ${userId}
      LEFT JOIN "ProjectFunding" pf ON p."id" = pf."projectId"
      LEFT JOIN "ProjectSnapshot" ps ON p."id" = ps."projectId"
      LEFT JOIN "Application" a ON p."id" = a."projectId"
      LEFT JOIN "ProjectLinks" pl ON p."id" = pl."projectId"
      LEFT JOIN "FundingReward" fr ON p."id" = fr."projectId"
      LEFT JOIN "RewardClaim" rc ON fr."id" = rc."rewardId"
      WHERE p."deletedAt" IS NULL
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
          DISTINCT to_jsonb(fr.*) || 
          jsonb_build_object(
            'claim', to_jsonb(rc.*)
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
            'project',  to_jsonb(op.*)
          )
        ) as projects
      FROM "org_projects" op
      GROUP BY "organization_id", "organization_name"
    )
    SELECT jsonb_build_object(
      'projects', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'project', to_jsonb(up.*)
          )
        )
        FROM "user_projects" up),
        '[]'::jsonb
      ),
      'organizations', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'organization', to_jsonb(og.*)
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

export const getAllPublishedUserProjects = cache(
  (params: { userId: string }) =>
    getAllPublishedUserProjectsFn(params, prisma),
)

export async function getAllPublishedUserProjectsWithClient(
  params: { userId: string },
  db: PrismaClient = prisma,
) {
  return getAllPublishedUserProjectsFn(params, db)
}

async function getProjectFn(
  {
    id,
  }: {
    id: string
  },
  db: PrismaClient = prisma,
): Promise<ProjectWithFullDetails | null> {
  const result = await db.$queryRaw<{ result: ProjectWithFullDetails }[]>`
    WITH impact_statements AS (
      SELECT 
        cat."id" as category_id,
        COALESCE(jsonb_agg(DISTINCT to_jsonb(imp.*)), '[]'::jsonb) as statements
      FROM "Category" cat
      LEFT JOIN "ImpactStatement" imp ON cat."id" = imp."categoryId"
      GROUP BY cat."id"
    ),
    project_data AS (
      SELECT 
        p.*,
        po."organizationId",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(r.*)) FILTER (WHERE r."id" IS NOT NULL), '[]'::jsonb) as "repos",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(l.*)) FILTER (WHERE l."id" IS NOT NULL), '[]'::jsonb) as "links",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(f.*)) FILTER (WHERE f."id" IS NOT NULL), '[]'::jsonb) as "funding",
        COALESCE((
          SELECT jsonb_agg(to_jsonb(s.*))
          FROM (
            SELECT DISTINCT ON (s2."id") s2.*
            FROM "ProjectSnapshot" s2
            WHERE s2."projectId" = p."id"
            ORDER BY s2."id", s2."createdAt" ASC
          ) s
        ), '[]'::jsonb) as "snapshots",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(a.*) || jsonb_build_object(
          'category', to_jsonb(cat.*) || jsonb_build_object(
            'impactStatements', ist.statements
          ),
          'impactStatementAnswer', to_jsonb(isa.*),
          'round', to_jsonb(rnd.*)
        )) FILTER (WHERE a."id" IS NOT NULL), '[]'::jsonb) as "applications",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(fr.*) || jsonb_build_object(
          'claim', to_jsonb(rc.*)
        )) FILTER (WHERE fr."id" IS NOT NULL), '[]'::jsonb) as "rewards",
        CASE 
          WHEN po."id" IS NOT NULL THEN jsonb_build_object(
            'organization', to_jsonb(o.*)
          )
          ELSE NULL
        END as "organization"
      FROM "Project" p
      LEFT JOIN "ProjectRepository" r ON p."id" = r."projectId"
      LEFT JOIN "ProjectLinks" l ON p."id" = l."projectId"
      LEFT JOIN "ProjectFunding" f ON p."id" = f."projectId"
      LEFT JOIN "ProjectSnapshot" s ON p."id" = s."projectId"
      LEFT JOIN "Application" a ON p."id" = a."projectId"
      LEFT JOIN "Category" cat ON a."categoryId" = cat."id"
      LEFT JOIN impact_statements ist ON cat."id" = ist.category_id
      LEFT JOIN "ImpactStatementAnswer" isa ON a."id" = isa."applicationId"
      LEFT JOIN "FundingRound" rnd ON a."roundId" = rnd."id"
      LEFT JOIN "FundingReward" fr ON p."id" = fr."projectId"
      LEFT JOIN "RewardClaim" rc ON fr."id" = rc."rewardId"
      LEFT JOIN "ProjectOrganization" po ON p."id" = po."projectId" AND po."deletedAt" IS NULL
      LEFT JOIN "Organization" o ON po."organizationId" = o."id" AND o."deletedAt" IS NULL
      WHERE p."id" = ${id}
      GROUP BY p."id", po."id", po."organizationId", o."id", o."name"
    )
    SELECT to_jsonb(pd.*) as result
    FROM project_data pd;
  `

  return result[0]?.result
}

export const getProject = cache((params: { id: string }) =>
  getProjectFn(params, prisma),
)

export async function getProjectWithClient(
  params: { id: string },
  db: PrismaClient = prisma,
) {
  return getProjectFn(params, db)
}

export async function getProjectFresh({
  id,
}: {
  id: string
}): Promise<ProjectWithFullDetails | null> {
  return getProjectFn({ id })
}

async function getProjectTeamFn(
  {
    id,
  }: {
    id: string
  },
  db: PrismaClient = prisma,
): Promise<ProjectWithTeam | null> {
  const result = await db.$queryRaw<{ result: ProjectWithTeam }[]>`
    WITH project_data AS (
      SELECT 
        p.*,
        COALESCE(jsonb_agg(DISTINCT to_jsonb(t.*)) FILTER (WHERE t."id" IS NOT NULL AND t."deletedAt" IS NULL), '[]'::jsonb) as "team"
      FROM "Project" p
      LEFT JOIN "UserProjects" t ON p."id" = t."projectId"
      WHERE p."id" = ${id}
      GROUP BY p."id"
    )
    SELECT to_jsonb(pd.*) as result
    FROM project_data pd;
  `

  return result[0]?.result
}

export const getProjectTeam = cache((params: { id: string }) =>
  getProjectTeamFn(params, prisma),
)

export async function getProjectTeamWithClient(
  params: { id: string },
  db: PrismaClient = prisma,
) {
  return getProjectTeamFn(params, db)
}

async function getConsolidatedProjectTeamFn(
  {
    projectId,
  }: {
    projectId: string
  },
  db: PrismaClient = prisma,
): Promise<ProjectTeam> {
  const result = await db.$queryRaw<{ result: ProjectTeam }[]>`
    WITH project_data AS (
      SELECT 
        p.*,
        COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', t."id",
            'role', t."role",
            'projectId', t."projectId",
            'user', to_jsonb(u.*)
          )
        ) FILTER (WHERE t."id" IS NOT NULL AND t."deletedAt" IS NULL), '[]'::jsonb) as "team"
      FROM "Project" p
      LEFT JOIN "UserProjects" t ON p."id" = t."projectId"
      LEFT JOIN "User" u ON t."userId" = u."id"
      WHERE p."id" = ${projectId}
      GROUP BY p."id"
    ),
    organization_data AS (
      SELECT 
        o.*,
        COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', uo."id",
            'role', uo."role",
            'organizationId', uo."organizationId",
            'user', to_jsonb(u.*)
          )
        ) FILTER (WHERE uo."id" IS NOT NULL AND uo."deletedAt" IS NULL), '[]'::jsonb) as "team"
      FROM "Organization" o
      LEFT JOIN "ProjectOrganization" po ON o."id" = po."organizationId"
      LEFT JOIN "UserOrganization" uo ON o."id" = uo."organizationId"
      LEFT JOIN "User" u ON uo."userId" = u."id"
      WHERE po."projectId" = ${projectId}
      GROUP BY o."id"
    ),
    result AS (
      SELECT to_jsonb(pd.*) as result
      FROM project_data pd
      UNION ALL
      SELECT to_jsonb(od.*) as result
      FROM organization_data od
    )
    SELECT result
    FROM (
      SELECT COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', t->>'id',
            'role', t->>'role',
            'projectId', t->>'projectId',
            'organizationId', t->>'organizationId',
            'user', t->'user'
          )
        )
        FROM jsonb_array_elements(r.result->'team') t),
        '[]'::jsonb
      ) as result
      FROM result r
    ) final;
  `

  return result[0]?.result || []
}

export const getConsolidatedProjectTeam = cache(
  (params: { projectId: string }) =>
    getConsolidatedProjectTeamFn(params, prisma),
)

export async function getConsolidatedProjectTeamWithClient(
  params: { projectId: string },
  db: PrismaClient = prisma,
) {
  return getConsolidatedProjectTeamFn(params, db)
}

async function getAllProjectContractsFn(
  { projectId }: { projectId: string },
  db: PrismaClient = prisma,
) {
  return db.projectContract.findMany({
    where: {
      projectId: projectId,
    },
  })
}

export const getAllProjectContracts = cache((params: { projectId: string }) =>
  getAllProjectContractsFn(params, prisma),
)

export async function getAllProjectContractsWithClient(
  params: { projectId: string },
  db: PrismaClient = prisma,
) {
  return getAllProjectContractsFn(params, db)
}

async function getProjectContractsByDeployerFn(
  {
    projectId,
    deployerAddress,
  }: {
    projectId: string
    deployerAddress: string
  },
  db: PrismaClient = prisma,
): Promise<ProjectContractWithProject[]> {
  const result = await db.$queryRaw<
    { result: ProjectContractWithProject[] }[]
  >`
    WITH contract_data AS (
      SELECT 
        c.*,
        to_jsonb(p.*) as "project"
      FROM "ProjectContract" c
      LEFT JOIN "Project" p ON c."projectId" = p."id"
      WHERE c."projectId" = ${projectId}
        AND c."deployerAddress" = ${deployerAddress}
    )
    SELECT COALESCE(jsonb_agg(to_jsonb(cd.*)), '[]'::jsonb) as result
    FROM contract_data cd;
  `

  return result[0]?.result || []
}

export const getProjectContractsByDeployer = cache(
  (params: { projectId: string; deployerAddress: string }) =>
    getProjectContractsByDeployerFn(params, prisma),
)

export async function getProjectContractsByDeployerWithClient(
  params: { projectId: string; deployerAddress: string },
  db: PrismaClient = prisma,
) {
  return getProjectContractsByDeployerFn(params, db)
}

async function getProjectContractsFn(
  {
    projectId,
  }: {
    projectId: string
  },
  db: PrismaClient = prisma,
): Promise<ProjectContracts | null> {
  return db.project.findFirst({
    where: {
      id: projectId,
    },
    include: {
      contracts: true,
      publishedContracts: {
        where: {
          revokedAt: null,
        },
      },
    },
  })
}

export const getProjectContracts = cache((params: { projectId: string }) =>
  getProjectContractsFn(params),
)

export async function getProjectContractsWithClient(
  params: { projectId: string },
  db: PrismaClient = prisma,
) {
  return getProjectContractsFn(params, db)
}

export async function getProjectContractsFresh(
  {
    projectId,
  }: {
    projectId: string
  },
  db: PrismaClient = prisma,
): Promise<ProjectContracts | null> {
  return getProjectContractsFn({ projectId }, db)
}

async function getPublishedProjectContractsFn(
  {
    projectId,
    contacts,
  }: {
    projectId: string
    contacts: {
      chainId: number
      contractAddress: string
    }[]
  },
  db: PrismaClient = prisma,
): Promise<PublishedContract[]> {
  const normalizedContacts = contacts.map((c) => ({
    chainId: c.chainId,
    contractAddress: getAddress(c.contractAddress),
  }))

  const contactKey = new Set(
    normalizedContacts.map(
      (c) => `${c.contractAddress.toLowerCase()}:${c.chainId}`,
    ),
  )

  const projectContractsAll = await db.publishedContract.findMany({
    where: {
      projectId,
      revokedAt: null,
    },
  })

  const projectContracts = projectContractsAll.filter((contract) => {
    const key = `${getAddress(contract.contract).toLowerCase()}:${
      contract.chainId
    }`
    return !contactKey.has(key)
  })

  const relatedContracts: PublishedContract[] = []
  const contactsByChain = new Map<number, Set<string>>()
  for (const contact of normalizedContacts) {
    const key = contactsByChain.get(contact.chainId) ?? new Set<string>()
    key.add(contact.contractAddress)
    contactsByChain.set(contact.chainId, key)
  }

  for (const [chainId, addresses] of Array.from(contactsByChain.entries())) {
    const addressChunks = chunkArray(Array.from(addresses), 500)
    for (const chunk of addressChunks) {
      if (chunk.length === 0) continue

      const chunkResults = await db.publishedContract.findMany({
        where: {
          revokedAt: null,
          chainId,
          contract: {
            in: chunk,
          },
        },
      })

      relatedContracts.push(...chunkResults)
    }
  }

  const uniqueRelated = new Map<string, PublishedContract>()
  relatedContracts.forEach((contract) => {
    uniqueRelated.set(contract.id, contract)
  })

  return [...projectContracts, ...Array.from(uniqueRelated.values())]
}

export const getPublishedProjectContracts = cache(
  (params: {
    projectId: string
    contacts: { chainId: number; contractAddress: string }[]
  }) => getPublishedProjectContractsFn(params, prisma),
)

export async function getPublishedProjectContractsWithClient(
  params: {
    projectId: string
    contacts: { chainId: number; contractAddress: string }[]
  },
  db: PrismaClient = prisma,
) {
  return getPublishedProjectContractsFn(params, db)
}

async function getUserApplicationsFn(
  {
    userId,
    roundId,
  }: {
    userId: string
    roundId?: string
  },
  db: PrismaClient = prisma,
): Promise<ApplicationWithDetails[]> {
  const result = await db.$queryRaw<{ result: ApplicationWithDetails[] }[]>`
    WITH user_applications AS (
      SELECT DISTINCT
        a.*,
        to_jsonb(p.*) as "project",
        to_jsonb(fr.*) as "round",
        COALESCE(
          jsonb_agg(
            DISTINCT to_jsonb(isa.*) || jsonb_build_object(
              'impactStatement', to_jsonb(ist.*)
            )
          ) FILTER (WHERE isa."id" IS NOT NULL),
          '[]'::jsonb
        ) as "impactStatementAnswer",
        a."projectDescriptionOptions"
      FROM "User" u
      LEFT JOIN "UserProjects" up ON u."id" = up."userId" AND up."deletedAt" IS NULL
      LEFT JOIN "Project" p1 ON up."projectId" = p1."id" AND p1."deletedAt" IS NULL
      LEFT JOIN "Application" a1 ON p1."id" = a1."projectId"
      LEFT JOIN "UserOrganization" uo ON u."id" = uo."userId" AND uo."deletedAt" IS NULL
      LEFT JOIN "Organization" o ON uo."organizationId" = o."id" AND o."deletedAt" IS NULL
      LEFT JOIN "ProjectOrganization" po ON o."id" = po."organizationId" AND po."deletedAt" IS NULL
      LEFT JOIN "Project" p2 ON po."projectId" = p2."id" AND p2."deletedAt" IS NULL
      LEFT JOIN "Application" a2 ON p2."id" = a2."projectId"
      LEFT JOIN "Project" p ON COALESCE(a1."projectId", a2."projectId") = p."id"
      LEFT JOIN "Application" a ON COALESCE(a1."id", a2."id") = a."id"
      LEFT JOIN "FundingRound" fr ON a."roundId" = fr."id"
      LEFT JOIN "ImpactStatementAnswer" isa ON a."id" = isa."applicationId"
      LEFT JOIN "ImpactStatement" ist ON isa."impactStatementId" = ist."id"
      WHERE u."id" = ${userId}
        AND a."id" IS NOT NULL
      ${roundId ? Prisma.sql`AND a."roundId" = ${roundId}` : Prisma.empty}
      GROUP BY a.id, p.id, fr.id
    )
    SELECT COALESCE(
      jsonb_agg(
        to_jsonb(ua.*)
        ORDER BY ua."createdAt" DESC
      ),
      '[]'::jsonb
    ) as result
    FROM user_applications ua;
  `

  return result[0]?.result || []
}

export const getUserApplications = cache(
  (params: { userId: string; roundId?: string }) =>
    getUserApplicationsFn(params),
)

export async function getUserApplicationsWithClient(
  params: { userId: string; roundId?: string },
  db: PrismaClient = prisma,
) {
  return getUserApplicationsFn(params, db)
}

export type CreateProjectParams = Partial<
  Omit<Project, "id" | "createdAt" | "updatedAt" | "deletedAt">
> & {
  name: string
}

export async function createProject(
  {
    userId,
    projectId,
    organizationId,
    project,
  }: {
    userId: string
    projectId: string
    organizationId?: string
    project: CreateProjectParams
  },
  context: DbContext = {},
) {
  return withChangelogTracking(
    async (tx) => {
      const orgMembers = organizationId
        ? await tx.userOrganization
            .findMany({
              where: { organizationId, deletedAt: null },
              select: { userId: true },
            })
            .then((members) =>
              members
                .filter((member) => member.userId !== userId)
                .map((member) => ({
                  role: "member",
                  user: { connect: { id: member.userId } },
                })),
            )
        : []
      return tx.project.create({
        data: {
          id: projectId,
          ...project,
          team: {
            create: [
              {
                role: "admin" satisfies TeamRole,
                user: { connect: { id: userId } },
              },
              ...orgMembers,
            ],
          },
          organization: organizationId
            ? { create: { organization: { connect: { id: organizationId } } } }
            : undefined,
        },
      })
    },
    undefined,
    { db: context.db, session: context.session },
  )
}

export type UpdateProjectParams = Partial<
  Omit<Project, "id" | "createdAt" | "updatedAt" | "deletedAt">
>

export async function updateProject(
  {
    id,
    project,
  }: {
    id: string
    project: UpdateProjectParams
  },
  context: DbContext = {},
) {
  return withChangelogTracking(
    async (tx) => {
      return tx.project.update({
        where: { id },
        data: { ...project, lastMetadataUpdate: new Date() },
      })
    },
    undefined,
    { db: context.db, session: context.session },
  )
}

export async function updateProjectOrganization(
  {
    projectId,
    organizationId,
  }: {
    projectId: string
    organizationId: string
  },
  db: PrismaClient = prisma,
) {
  return db.projectOrganization.upsert({
    where: { projectId },
    update: { organizationId },
    create: { projectId, organizationId },
  })
}

export async function removeProjectOrganization(
  {
    projectId,
  }: {
    projectId: string
  },
  db: PrismaClient = prisma,
) {
  return db.projectOrganization.deleteMany({
    where: { projectId },
  })
}

export async function deleteProject(
  { id }: { id: string },
  context: DbContext = {},
) {
  return withChangelogTracking(
    async (tx) => {
      const updatedProject = await tx.project.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      const deletedRepositories = await tx.projectRepository.deleteMany({
        where: { projectId: id },
      })
      return { updatedProject, deletedRepositories }
    },
    undefined,
    { db: context.db, session: context.session },
  )
}

export async function addTeamMembers(
  {
    projectId,
    userIds,
    role = "member",
  }: {
    projectId: string
    userIds: string[]
    role?: TeamRole
  },
  context: DbContext = {},
) {
  // There may be users who were previously soft deleted, so this is complex
  return withChangelogTracking(
    async (tx) => {
      const deletedMembers = await tx.userProjects.findMany({
        where: { projectId, userId: { in: userIds } },
      })
      const updateMemberIds = deletedMembers.map((m) => m.userId)
      const createMemberIds = userIds.filter(
        (id) => !updateMemberIds.includes(id),
      )

      await tx.userProjects.updateMany({
        where: { projectId, userId: { in: updateMemberIds } },
        data: { deletedAt: null },
      })

      if (createMemberIds.length > 0) {
        await tx.userProjects.createMany({
          data: createMemberIds.map((userId) => ({ role, userId, projectId })),
        })
      }

      await tx.project.update({
        where: { id: projectId },
        data: { lastMetadataUpdate: new Date() },
      })
    },
    undefined,
    { db: context.db, session: context.session },
  )
}

export async function updateMemberRole(
  {
    projectId,
    userId,
    role,
  }: {
    projectId: string
    userId: string
    role: TeamRole
  },
  context: DbContext = {},
) {
  return withChangelogTracking(
    async (tx) => {
      await tx.userProjects.update({
        where: { userId_projectId: { projectId, userId } },
        data: { role },
      })

      await tx.project.update({
        where: { id: projectId },
        data: { lastMetadataUpdate: new Date() },
      })
    },
    undefined,
    { db: context.db, session: context.session },
  )
}

export async function removeTeamMember(
  {
    projectId,
    userId,
  }: {
    projectId: string
    userId: string
  },
  context: DbContext = {},
) {
  return withChangelogTracking(
    async (tx) => {
      await tx.userProjects.update({
        where: { userId_projectId: { projectId, userId } },
        data: { role: "member", deletedAt: new Date() },
      })

      await tx.project.update({
        where: { id: projectId },
        data: { lastMetadataUpdate: new Date() },
      })
    },
    undefined,
    { db: context.db, session: context.session },
  )
}

export async function addProjectContracts(
  projectId: string,
  contracts: Omit<Prisma.ProjectContractCreateManyInput, "project">[],
  db: PrismaClient = prisma,
) {
  const client = db
  const normalizedContracts = contracts.map((contract) => ({
    ...contract,
    contractAddress: getAddress(contract.contractAddress),
    deployerAddress: getAddress(contract.deployerAddress),
  }))

  const keyFor = (contract: { contractAddress: string; chainId: number }) =>
    `${contract.contractAddress}:${contract.chainId}`

  const uniqueLookupTargets = new Map<
    string,
    { contractAddress: string; chainId: number }
  >()

  for (const contract of normalizedContracts) {
    const key = keyFor(contract)
    if (!uniqueLookupTargets.has(key)) {
      uniqueLookupTargets.set(key, {
        contractAddress: contract.contractAddress,
        chainId: contract.chainId,
      })
    }
  }

  const existingKeys = new Set<string>()
  const lookupChunks = chunkArray(
    Array.from(uniqueLookupTargets.values()),
    500,
  )

  for (const chunk of lookupChunks) {
    if (chunk.length === 0) continue

    const existing = await client.projectContract.findMany({
      where: {
        OR: chunk.map(({ contractAddress, chainId }) => ({
          contractAddress,
          chainId,
        })),
      },
      select: {
        contractAddress: true,
        chainId: true,
      },
    })

    existing.forEach(({ contractAddress, chainId }) =>
      existingKeys.add(keyFor({ contractAddress, chainId })),
    )
  }

  const failedContracts: Omit<
    Prisma.ProjectContractCreateManyInput,
    "project"
  >[] = []
  const contractsToCreate: Omit<
    Prisma.ProjectContractCreateManyInput,
    "project"
  >[] = []

  for (const contract of normalizedContracts) {
    const key = keyFor(contract)
    if (existingKeys.has(key)) {
      failedContracts.push(contract)
    } else {
      contractsToCreate.push(contract)
      existingKeys.add(key)
    }
  }

  const insertedKeys = new Set<string>()
  const creationChunks = chunkArray(contractsToCreate, 100)

  for (const chunk of creationChunks) {
    if (chunk.length === 0) continue

    try {
      await client.projectContract.createMany({
        data: chunk,
        skipDuplicates: true,
      })
      chunk.forEach((contract) => insertedKeys.add(keyFor(contract)))
    } catch (error) {
      console.error(`Failed to create contract batch:`, error)
      chunk.forEach((contract) => failedContracts.push(contract))
    }
  }

  let createdContracts: ProjectContract[] = []
  if (insertedKeys.size > 0) {
    const keysToFetch = Array.from(insertedKeys).map((key) => {
      const [contractAddress, chainId] = key.split(":")
      return {
        contractAddress,
        chainId: Number(chainId),
      }
    })

    const fetchChunks = chunkArray(keysToFetch, 500)
    for (const chunk of fetchChunks) {
      if (chunk.length === 0) continue
      const results = await client.projectContract.findMany({
        where: {
          projectId,
          OR: chunk.map(({ contractAddress, chainId }) => ({
            contractAddress,
            chainId,
          })),
        },
      })
      createdContracts = createdContracts.concat(results)
    }
  }

  await client.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return {
    createdContracts,
    failedContracts,
  }
}

export async function upsertProjectContracts(
  projectId: string,
  contracts: Omit<Prisma.ProjectContractCreateManyInput, "project">[],
  db: PrismaClient = prisma,
) {
  const client = db
  const createOperations = contracts.map(async (contract) => {
    try {
      const result = await client.projectContract.upsert({
        where: {
          contractAddress_chainId: {
            contractAddress: getAddress(contract.contractAddress),
            chainId: contract.chainId,
          },
        },
        update: {
          projectId,
        },
        create: {
          ...contract,
          contractAddress: getAddress(contract.contractAddress),
          deployerAddress: getAddress(contract.deployerAddress),
        },
      })
      return { success: true, data: result }
    } catch (error) {
      console.error(`Failed to create contract:`, error)
      return { success: false, data: contract, error }
    }
  })
  const results = await Promise.all(createOperations)
  const createdContracts = {
    succeeded: results.filter((r) => r.success).map((r) => r.data),
    failed: results.filter((r) => !r.success).map((r) => r.data),
  }
  await client.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })
  return {
    createdContracts: createdContracts.succeeded,
    failedContracts: createdContracts.failed,
  }
}

export async function addProjectContract(
  {
    projectId,
    contract,
  }: {
    projectId: string
    contract: Omit<Prisma.ProjectContractCreateInput, "project">
  },
  db: PrismaClient = prisma,
) {
  const client = db
  const contractCreate = client.projectContract.upsert({
    where: {
      contractAddress_chainId: {
        contractAddress: getAddress(contract.contractAddress),
        chainId: contract.chainId,
      },
    },
    update: {
      project: {
        connect: {
          id: projectId,
        },
      },
    },
    create: {
      ...contract,
      contractAddress: getAddress(contract.contractAddress),
      deployerAddress: getAddress(contract.deployerAddress),
      project: {
        connect: {
          id: projectId,
        },
      },
    },
  })

  const projectUpdate = client.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return client.$transaction([contractCreate, projectUpdate])
}

export async function updateProjectContract(
  {
    projectId,
    contractAddress,
    chainId,
    updates,
  }: {
    projectId: string
    contractAddress: Address
    chainId: number
    updates: Prisma.ProjectContractUpdateInput
  },
  db: PrismaClient = prisma,
) {
  const client = db
  const contractUpdate = client.projectContract.update({
    where: {
      projectId,
      contractAddress_chainId: {
        contractAddress: getAddress(contractAddress),
        chainId,
      },
    },
    data: updates,
  })

  const projectUpdate = client.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return client.$transaction([contractUpdate, projectUpdate])
}

export async function removeProjectContractsByDeployer(
  projectId: string,
  deployer: string,
  db: PrismaClient = prisma,
) {
  const client = db
  const contractDelete = client.projectContract.deleteMany({
    where: {
      projectId: projectId,
      deployerAddress: getAddress(deployer),
    },
  })

  const projectUpdate = client.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return client.$transaction([contractDelete, projectUpdate])
}

export async function removeProjectContract(
  {
    projectId,
    address,
    chainId,
  }: {
    projectId: string
    address: string
    chainId: number
  },
  db: PrismaClient = prisma,
) {
  const client = db
  const contractDelete = client.projectContract.delete({
    where: {
      projectId,
      contractAddress_chainId: {
        contractAddress: getAddress(address),
        chainId,
      },
    },
  })

  const projectUpdate = client.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return client.$transaction([contractDelete, projectUpdate])
}

export async function addProjectRepository(
  {
    projectId,
    repo,
  }: {
    projectId: string
    repo: Omit<Prisma.ProjectRepositoryCreateInput, "project">
  },
  db: PrismaClient = prisma,
) {
  const client = db
  const repoCreate = client.projectRepository.upsert({
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

  const projectUpdate = client.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  const [repository] = await client.$transaction([
    repoCreate,
    projectUpdate,
  ])

  return repository
}

export async function removeProjectRepository(
  {
    projectId,
    repositoryUrl,
  }: {
    projectId: string
    repositoryUrl: string
  },
  db: PrismaClient = prisma,
) {
  const client = db
  const repoDelete = client.projectRepository.delete({
    where: {
      projectId: projectId,
      url: repositoryUrl,
    },
  })

  const projectUpdate = client.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return client.$transaction([repoDelete, projectUpdate])
}

export async function updateProjectRepository(
  {
    projectId,
    url,
    updates,
  }: {
    projectId: string
    url: string
    updates: Prisma.ProjectRepositoryUpdateInput
  },
  db: PrismaClient = prisma,
) {
  const client = db
  const repoUpdate = client.projectRepository.update({
    where: {
      projectId,
      url,
    },
    data: updates,
  })

  const projectUpdate = client.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return client.$transaction([repoUpdate, projectUpdate])
}

export async function updateProjectRepositories(
  {
    projectId,
    type,
    repositories,
  }: {
    projectId: string
    type: string
    repositories: Prisma.ProjectRepositoryCreateManyInput[]
  },
  db: PrismaClient = prisma,
) {
  const client = db
  // Delete the existing repositories and replace it
  const remove = client.projectRepository.deleteMany({
    where: {
      projectId,
      type,
    },
  })

  const create = client.projectRepository.createMany({
    data: repositories.map((r) => ({
      ...r,
      projectId,
    })),
  })

  const update = client.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return client.$transaction([remove, create, update])
}

export async function updateProjectLinks(
  {
    projectId,
    links,
  }: {
    projectId: string
    links: Prisma.ProjectLinksCreateManyInput[]
  },
  db: PrismaClient = prisma,
) {
  const client = db
  // Delete the existing links and replace it
  const remove = client.projectLinks.deleteMany({
    where: {
      projectId,
    },
  })

  const create = client.projectLinks.createMany({
    data: links.map((l) => ({
      ...l,
      projectId,
    })),
  })

  const update = client.project.update({
    where: {
      id: projectId,
    },
    data: {
      lastMetadataUpdate: new Date(),
    },
  })

  return client.$transaction([remove, create, update])
}

export async function updateProjectFunding(
  {
    projectId,
    funding,
  }: {
    projectId: string
    funding: Prisma.ProjectFundingCreateManyInput[]
  },
  db: PrismaClient = prisma,
) {
  // Delete the existing funding and replace it
  const remove = db.projectFunding.deleteMany({
    where: {
      projectId,
    },
  })

  const create = db.projectFunding.createMany({
    data: funding.map((f) => ({
      ...f,
      projectId,
    })),
  })

  // Mark that the project was funded
  const update = db.project.update({
    where: {
      id: projectId,
    },
    data: {
      addedFunding: true,
      lastMetadataUpdate: new Date(),
    },
  })

  return db.$transaction([remove, create, update])
}

export async function addProjectSnapshot(
  {
    projectId,
    ipfsHash,
    attestationId,
  }: {
    projectId: string
    ipfsHash: string
    attestationId: string
  },
  db: PrismaClient = prisma,
) {
  return db.projectSnapshot.create({
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

export async function addPublishedContracts(
  contracts: {
    id: string
    contract: string
    deploymentTx: string
    deployer: string
    verificationChainId: number
    signature: string
    chainId: number
    projectId: string
  }[],
  db: PrismaClient = prisma,
) {
  return db.publishedContract.createMany({
    data: contracts,
    skipDuplicates: true,
  })
}

export async function revokePublishedContracts(
  attestationIds: string[],
  db: PrismaClient = prisma,
) {
  return db.publishedContract.updateMany({
    where: {
      id: {
        in: attestationIds,
      },
    },
    data: {
      revokedAt: new Date(),
    },
  })
}

export async function createApplication(
  {
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
  },
  context?: { db?: PrismaClient; session?: Session | null },
) {
  return withChangelogTracking(
    async (tx) => {
      return tx.application.create({
        data: {
          attestationId,
          projectDescriptionOptions: projectDescriptionOptions ?? [],
          project: { connect: { id: projectId } },
          round: { connect: { id: round.toString() } },
          category: categoryId ? { connect: { id: categoryId } } : undefined,
          impactStatementAnswer: {
            createMany: {
              data: impactStatement
                ? Object.entries(impactStatement).map(
                    ([impactStatementId, answer]) => ({
                      impactStatementId,
                      answer,
                    }),
                  )
                : [],
            },
          },
        },
      })
    },
    undefined,
    { db: context?.db, session: context?.session },
  )
}

async function getAllApplicationsForRoundFn(
  {
    roundId,
  }: {
    roundId: string
  },
  db: PrismaClient = prisma,
): Promise<ApplicationWithDetails[]> {
  const applications = await db.application.findMany({
    where: {
      roundId,
    },
    include: {
      project: true,
      impactStatementAnswer: {
        include: {
          impactStatement: true,
        },
      },
      round: true,
    },
  })

  return applications
}

export const getAllApplicationsForRound = cache(
  (params: { roundId: string }) =>
    getAllApplicationsForRoundFn(params, prisma),
)

export async function getAllApplicationsForRoundWithClient(
  params: { roundId: string },
  db: PrismaClient = prisma,
) {
  return getAllApplicationsForRoundFn(params, db)
}

export async function updateAllForProject(
  project: ProjectMetadata & {
    contracts: {
      address: string
      deploymentTxHash: string
      deployerAddress: string
      verificationProof: string | null
      chainId: number
    }[]
  },
  projectId: string,
  db: PrismaClient = prisma,
) {
  // Update project
  const projectUpdate = db.project.update({
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

  const cleanupContracts = db.projectContract.deleteMany({
    where: {
      projectId,
    },
  })

  const contractsCreate = db.projectContract.createMany({
    data: project.contracts.map((contract) => ({
      contractAddress: contract.address,
      deploymentHash: contract.deploymentTxHash,
      deployerAddress: contract.deployerAddress,
      verificationProof: contract.verificationProof ?? "0x0",
      chainId: contract.chainId,
      projectId,
    })),
  })

  const cleanupRepositories = db.projectRepository.deleteMany({
    where: {
      projectId,
    },
  })

  const createRepositories = db.projectRepository.createMany({
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

  const cleanupFunding = db.projectFunding.deleteMany({
    where: {
      projectId,
    },
  })

  const createFunding = db.projectFunding.createMany({
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

  return db.$transaction([
    projectUpdate,
    cleanupContracts,
    contractsCreate,
    cleanupRepositories,
    createRepositories,
    cleanupFunding,
    createFunding,
  ])
}

export async function createProjectKycTeam(
  {
    projectId,
    walletAddress,
  }: {
    projectId: string
    walletAddress: string
  },
  db: PrismaClient = prisma,
) {
  try {
    const kycTeam = await db.$transaction(async (tx) => {
      // Check if project already has a kyc team
      const project = await tx.project.findUnique({
        where: {
          id: projectId,
          kycTeam: {
            rewardStreams: {
              some: {},
            },
          },
        },
        select: {
          kycTeam: {
            select: {
              id: true,
              rewardStreams: true,
            },
            where: {
              rewardStreams: {
                some: {},
              },
            },
          },
        },
      })

      const kycTeam = await tx.kYCTeam.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
        },
      })

      await tx.rewardStream.updateMany({
        where: {
          id: {
            in:
              project?.kycTeam?.rewardStreams.map((stream) => stream.id) ?? [],
          },
        },
        data: {
          kycTeamId: kycTeam.id,
        },
      })

      await tx.project.update({
        where: {
          id: projectId,
        },
        data: {
          kycTeamId: kycTeam.id,
        },
      })

      return kycTeam
    })

    return { id: kycTeam.id, walletAddress: kycTeam.walletAddress, error: null }
  } catch (error: any) {
    if (error.message.includes("Unique constraint failed")) {
      return { error: "KYC team with this Wallet Address already exists" }
    }

    return { error: error.message }
  }
}

export async function getKycTeamForProject(
  {
    projectId,
  }: {
    projectId: string
  },
  db: PrismaClient = prisma,
) {
  const projectKycTeam = await db.project.findFirst({
    where: {
      id: projectId,
    },
    include: {
      organization: {
        select: {
          organization: {
            select: {
              id: true,
            },
          },
        },
      },
      kycTeam: {
        where: {
          deletedAt: null,
        },
        include: {
          team: {
            select: {
              users: true,
            },
          },
          KYCLegalEntityTeams: {
            include: {
              legalEntity: true,
            },
          },
          rewardStreams: true,
          projects: {
            include: {
              blacklist: true,
            },
          },
        },
      },
    },
  })

  return projectKycTeam ?? undefined
}

export async function addKYCTeamMembers(
  {
    kycTeamId,
    individuals,
    businesses,
  }: {
    kycTeamId: string
    individuals: {
      firstName: string
      lastName: string
      email: string
    }[]
    businesses: {
      firstName: string
      lastName: string
      email: string
      companyName: string
    }[]
  },
  db: PrismaClient = prisma,
) {
  const individualEmails = individuals.map((i) => i.email)
  const businessControllerEmails = businesses.map((b) => b.email)

  const [
    existingUsers,
    existingEntities,
    currentUserTeam,
    currentEntityTeam,
  ] = await Promise.all([
    db.kYCUser.findMany({
      where: { email: { in: individualEmails } },
      include: {
        KYCUserTeams: true,
      },
    }),
    db.kYCLegalEntity.findMany({
      where: {
        kycLegalEntityController: {
          email: { in: businessControllerEmails },
        },
      },
      include: {
        kycLegalEntityController: true,
        teamLinks: true,
      },
    }),
    db.kYCUserTeams.findMany({
      where: { kycTeamId, team: { deletedAt: null } },
    }),
    db.kYCLegalEntityTeams.findMany({
      where: { kycTeamId },
    }),
  ])

  const existingIndividualUserMap = new Map(
    existingUsers.map((u) => [u.email, u]),
  )
  const existingBusinessEntityMap = new Map(
    existingEntities.map((e) => [e.kycLegalEntityController?.email, e]),
  )

  const newIndividuals = individuals.filter(
    (i) => !existingIndividualUserMap.get(i.email),
  )
  const newBusinesses = businesses.filter(
    (b) => !existingBusinessEntityMap.get(b.email),
  )

  // Remove individual users no longer in the team
  const usersToRemove = [
    ...existingUsers
      .filter((u) => u.KYCUserTeams.some((t) => t.kycTeamId === kycTeamId))
      .filter((u) => !individuals.some((i) => i.email === u.email))
      .map((u) => u.KYCUserTeams.find((t) => t.kycTeamId === kycTeamId)!.id),
    ...currentUserTeam
      .filter((t) => !existingUsers.some((e) => e.id === t.kycUserId))
      .map((t) => t.id),
  ]

  // Remove business entities no longer in the team
  const entitiesToRemove = [
    ...existingEntities
      .filter((e) => e.teamLinks.some((t) => t.kycTeamId === kycTeamId))
      .filter((e) => !businesses.some((b) => b.email === e.kycLegalEntityController?.email))
      .map((e) => ({ kycTeamId, legalEntityId: e.id })),
    ...currentEntityTeam
      .filter((t) => !existingEntities.some((e) => e.id === t.legalEntityId))
      .map((t) => ({ kycTeamId: t.kycTeamId, legalEntityId: t.legalEntityId })),
  ]

  // Add existing users not yet in the team
  const usersToAdd = existingUsers
    .filter((u) => u.KYCUserTeams.every((t) => t.kycTeamId !== kycTeamId))
    .filter((u) => !newIndividuals.some((i) => i.email === u.email))

  // Add existing entities not yet in the team
  const entitiesToAdd = existingEntities
    .filter((e) => e.teamLinks.every((t) => t.kycTeamId !== kycTeamId))
    .filter((e) => !newBusinesses.some((b) => b.email === e.kycLegalEntityController?.email))

  await db.$transaction(async (tx) => {
    // Create new individual KYC users
    const createdIndividuals = await tx.kYCUser.createManyAndReturn({
      data: newIndividuals.map((i) => ({
        email: i.email,
        firstName: i.firstName,
        lastName: i.lastName,
        expiry: new Date(),
      })),
    })

    // Create new business legal entities with controllers
    const createdEntities = []
    for (const b of newBusinesses) {
      const entity = await tx.kYCLegalEntity.create({
        data: {
          name: b.companyName,
          kycLegalEntityController: {
            create: {
              firstName: b.firstName,
              lastName: b.lastName,
              email: b.email.toLowerCase(),
            },
          },
        },
        include: {
          kycLegalEntityController: true,
        },
      })
      createdEntities.push(entity)
    }

    // Send transactional emails
    await Promise.all([
      ...createdIndividuals.map(sendKYCStartedEmail),
      ...createdEntities.map((e) => sendKYBStartedEmail(e as any)),
    ])

    // Link users to team
    const allUsersToLink = [...usersToAdd, ...createdIndividuals]
    if (allUsersToLink.length > 0) {
      await tx.kYCUserTeams.createMany({
        data: allUsersToLink.map((u) => ({
          kycTeamId,
          kycUserId: u.id,
        })),
      })
    }

    // Link entities to team
    const allEntitiesToLink = [...entitiesToAdd, ...createdEntities]
    if (allEntitiesToLink.length > 0) {
      await tx.kYCLegalEntityTeams.createMany({
        data: allEntitiesToLink.map((e) => ({
          kycTeamId,
          legalEntityId: e.id,
        })),
      })
    }

    // Remove old links
    if (usersToRemove.length > 0) {
      await tx.kYCUserTeams.deleteMany({
        where: {
          id: { in: usersToRemove },
        },
      })
    }

    if (entitiesToRemove.length > 0) {
      for (const { kycTeamId: teamId, legalEntityId } of entitiesToRemove) {
        await tx.kYCLegalEntityTeams.delete({
          where: {
            kycTeamId_legalEntityId: { kycTeamId: teamId, legalEntityId },
          },
        })
      }
    }
  })
}

export async function createProjectKycTeams(
  {
    projectIds,
    kycTeamId,
  }: {
    projectIds: string[]
    kycTeamId: string
  },
  db: PrismaClient = prisma,
) {
  // Check for projects with active reward streams before reassignment
  const projectsToCheck = await db.project.findMany({
    where: {
      id: { in: projectIds },
    },
    select: {
      id: true,
      name: true,
      kycTeam: {
        select: {
          rewardStreams: true,
        },
      },
    },
  })

  const projectsWithActiveStreams = projectsToCheck.filter(
    (project) =>
      project.kycTeam &&
      project.kycTeam.rewardStreams &&
      project.kycTeam.rewardStreams.length > 0,
  )

  if (projectsWithActiveStreams.length > 0) {
    const projectNames = projectsWithActiveStreams.map((p) => p.name).join(", ")
    throw new Error(
      `Cannot reassign KYC team: The following projects have active reward streams: ${projectNames}`,
    )
  }

  const updates = await db.project.updateMany({
    where: {
      id: { in: projectIds },
    },
    data: {
      kycTeamId,
    },
  })

  return updates
}

export async function detachProjectsFromKycTeam(
  {
    projectIds,
    kycTeamId,
  }: {
    projectIds: string[]
    kycTeamId: string
  },
  db: PrismaClient = prisma,
) {
  // Check for projects with active reward streams before detaching
  const projectsToCheck = await db.project.findMany({
    where: {
      id: { in: projectIds },
    },
    select: {
      id: true,
      name: true,
      kycTeam: {
        select: {
          rewardStreams: true,
        },
      },
    },
  })

  const projectsWithActiveStreams = projectsToCheck.filter(
    (project) =>
      project.kycTeam &&
      project.kycTeam.rewardStreams &&
      project.kycTeam.rewardStreams.length > 0,
  )

  if (projectsWithActiveStreams.length > 0) {
    const projectNames = projectsWithActiveStreams.map((p) => p.name).join(", ")
    throw new Error(
      `Cannot detach projects from KYC team: The following projects have active reward streams: ${projectNames}`,
    )
  }

  // Just detach the projects from the KYC team, don't delete the team
  const updates = await db.project.updateMany({
    where: {
      id: { in: projectIds },
      kycTeamId: kycTeamId, // Ensure we only detach projects that are actually assigned to this team
    },
    data: {
      kycTeamId: null,
    },
  })

  return updates
}

export async function deleteProjectKycTeams(
  {
    projectIds,
    kycTeamId,
  }: {
    projectIds: string[]
    kycTeamId: string
  },
  db: PrismaClient = prisma,
) {
  // Check for projects with active reward streams before removal
  const projectsToCheck = await db.project.findMany({
    where: {
      id: { in: projectIds },
    },
    select: {
      id: true,
      name: true,
      kycTeam: {
        select: {
          rewardStreams: true,
        },
      },
    },
  })

  const projectsWithActiveStreams = projectsToCheck.filter(
    (project) =>
      project.kycTeam &&
      project.kycTeam.rewardStreams &&
      project.kycTeam.rewardStreams.length > 0,
  )

  if (projectsWithActiveStreams.length > 0) {
    const projectNames = projectsWithActiveStreams.map((p) => p.name).join(", ")
    throw new Error(
      `Cannot remove projects from KYC team: The following projects have active reward streams: ${projectNames}`,
    )
  }

  return await db.$transaction(async (tx) => {
    await tx.kYCTeam.update({
      where: {
        id: kycTeamId,
      },
      data: {
        deletedAt: new Date(),
      },
    })
    await tx.project.updateMany({
      where: {
        id: { in: projectIds },
      },
      data: {
        kycTeamId: null,
      },
    })
  })
}

export async function getProjectsForKycTeam(
  {
    kycTeamId,
  }: {
    kycTeamId: string
  },
  db: PrismaClient = prisma,
) {
  return db.project.findMany({
    where: {
      kycTeamId,
    },
  })
}

async function getPublicProjectFn(
  projectId: string,
  db: PrismaClient = prisma,
) {
  return db.project.findFirst({
    where: { id: projectId },
    include: {
      applications: {
        where: {
          roundId: {
            in: ["7", "8"],
          },
        },
      },
      links: true,
      contracts: true,
      repos: true,
      funding: true,
      rewards: {
        select: { roundId: true, amount: true },
      },
      organization: {
        select: {
          organization: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              team: {
                select: { user: true },
              },
            },
          },
        },
      },
      team: {
        orderBy: { createdAt: "asc" },
        select: { user: true },
      },
    },
  })
}

export const getPublicProject = cache((projectId: string) =>
  getPublicProjectFn(projectId),
)

export async function getPublicProjectWithClient(
  projectId: string,
  db: PrismaClient = prisma,
) {
  return getPublicProjectFn(projectId, db)
}

async function getProjectMetadataFn(
  projectId: string,
  db: PrismaClient = prisma,
) {
  return db.project.findFirst({
    where: { id: projectId, snapshots: { some: {} } },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      thumbnailUrl: true,
      bannerUrl: true,
      website: true,
      farcaster: true,
      twitter: true,
      mirror: true,
      contracts: {
        select: {
          chainId: true,
        },
      },
      organization: {
        select: {
          organization: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      team: {
        orderBy: { createdAt: "asc" },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              username: true,
            },
          },
        },
      },
    },
  })
}

export const getProjectMetadata = cache((projectId: string) =>
  getProjectMetadataFn(projectId),
)

export async function getProjectMetadataWithClient(
  projectId: string,
  db: PrismaClient = prisma,
) {
  return getProjectMetadataFn(projectId, db)
}

export async function getProjectsOSO(
  projectId: string,
  db: PrismaClient = prisma,
) {
  return await db.projectOSO.findFirst({
    where: {
      projectId,
    },
    select: {
      osoId: true,
    },
  })
}

// Combined OSO data query
export async function getProjectOSOData(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const [metrics, rewards] = await Promise.all([
    db.projectOSOMetrics.findMany({
      where: {
        projectId,
        OR: [
          // Eligibility metrics
          {
            metric: {
              in: [
                "IS_DEV_TOOLING_ELIGIBLE",
                "IS_ONCHAIN_BUILDER_ELIGIBLE",
                "HAS_DEFILLAMA_ADAPTER",
              ],
            },
          },
          // Performance metrics
          {
            metric: {
              in: ["ACTIVE_ADDRESSES_COUNT", "GAS_FEES", "TRANSACTION_COUNT"],
            },
          },
        ],
      },
      select: {
        metric: true,
        value: true,
        tranche: true,
      },
    }),
    db.recurringReward.findMany({
      where: {
        projectId,
        roundId: {
          in: ["7", "8"],
        },
      },
      select: {
        roundId: true,
        amount: true,
        tranche: true,
      },
    }).then(rewards =>
      rewards.map(r => ({
        ...r,
        amount: r.amount.toString(), // Convert Decimal to string
      }))
    ),
  ])

  return {
    metrics,
    rewards,
  }
}

// Updated eligibility queries
export async function getProjectEligibility(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const { metrics } = await getProjectOSOData(projectId, db)
  return metrics.filter(
    (e) => e.metric.startsWith("IS_") || e.metric === "HAS_DEFILLAMA_ADAPTER",
  )
}

export async function getDevToolingEligibility(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const { metrics } = await getProjectOSOData(projectId, db)
  return metrics.filter((e) => e.metric === "IS_DEV_TOOLING_ELIGIBLE")
}

export async function getOnchainBuilderEligibility(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const { metrics } = await getProjectOSOData(projectId, db)
  return metrics.filter((e) => e.metric === "IS_ONCHAIN_BUILDER_ELIGIBLE")
}

export async function getDefillamaAdapter(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const { metrics } = await getProjectOSOData(projectId, db)
  return metrics.filter((e) => e.metric === "HAS_DEFILLAMA_ADAPTER")
}

// Updated metrics queries
export async function getProjectMetrics(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const { metrics } = await getProjectOSOData(projectId, db)
  return metrics.filter((m) =>
    ["ACTIVE_ADDRESSES_COUNT", "GAS_FEES", "TRANSACTION_COUNT"].includes(
      m.metric,
    ),
  )
}

export async function getProjectActiveAddressesCount(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const { metrics } = await getProjectOSOData(projectId, db)
  return metrics.filter((m) => m.metric === "ACTIVE_ADDRESSES_COUNT")
}

export async function getProjectGasFees(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const { metrics } = await getProjectOSOData(projectId, db)
  return metrics.filter((m) => m.metric === "GAS_FEES")
}

export async function getProjectTransactions(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const { metrics } = await getProjectOSOData(projectId, db)
  return metrics.filter((m) => m.metric === "TRANSACTION_COUNT")
}

// Updated rewards queries
export async function getProjectRewards(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const { rewards } = await getProjectOSOData(projectId, db)
  return rewards
}

export async function getOnchainBuilderRecurringReward(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const { rewards } = await getProjectOSOData(projectId, db)
  return rewards.filter((r) => r.roundId === "8")
}

export async function getDevToolingRecurringReward(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const { rewards } = await getProjectOSOData(projectId, db)
  return rewards.filter((r) => r.roundId === "7")
}

export async function getTrustedDevelopersCountFromOSO(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const result = await db.projectOSOMetrics.findMany({
    where: { projectId, metric: "DEVELOPER_CONNECTION_COUNT" },
    select: {
      value: true,
      tranche: true,
    },
  })

  return result
}

export async function getTopProjectsFromOSO(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const projectOSOAtlasRelatedProjects =
    await db.projectOSOAtlasRelatedProjects.findMany({
      where: {
        projectId,
      },
      select: {
        tranche: true,
        targetProject: {
          select: {
            id: true,
            name: true,
            thumbnailUrl: true,
            website: true,
          },
        },
      },
    })

  return projectOSOAtlasRelatedProjects
}

export async function getProjectOSOByIds(
  {
    projectIds,
  }: {
    projectIds: string[]
  },
  db: PrismaClient = prisma,
) {
  return await db.projectOSO.findMany({
    where: {
      projectId: {
        in: projectIds,
      },
    },
    select: {
      projectId: true,
      osoId: true,
    },
  })
}

export async function createOSOProjects(
  osoProjects: Oso_ProjectsV1[],
  collections: Oso_ProjectsByCollectionV1[],
  db: PrismaClient = prisma,
) {
  return await db.projectOSO.createManyAndReturn({
    data: osoProjects.map((project) => {
      const funded = collections.find(
        (p) => p.projectName === project.projectName,
      )

      return {
        projectId: project.projectName,
        osoId: project.projectId,
        ...(funded && {
          roundId: funded.collectionName.split("-").at(0),
        }),
      }
    }),
    skipDuplicates: true,
  })
}

export async function getOSOMappedProjectIds(db: PrismaClient = prisma) {
  return await db.$transaction(async (tx) => {
    const existingOSO = await tx.projectOSO.findMany({
      select: { projectId: true },
    })

    const existingIds = existingOSO.map((r) => r.projectId)

    const projects = await tx.project.findMany({
      select: { id: true },
      where: { id: { notIn: existingIds } },
    })

    return projects.map(({ id }) => id)
  })
}

export async function getProjectOSORelatedProjects(
  projectId: string,
  db: PrismaClient = prisma,
) {
  return await db.projectOSORelatedProjects.findMany({
    where: { projectId },
    select: {
      osoId: true,
      projectId: true,
      tranche: true,
    },
  })
}

export async function getProjectTvl(
  projectId: string,
  db: PrismaClient = prisma,
) {
  return await db.projectOSOMetrics.findMany({
    where: { projectId, metric: "TVL" },
    select: { value: true, tranche: true },
  })
}

export async function getProjectGasConsumption(
  projectId: string,
  db: PrismaClient = prisma,
) {
  return await db.projectOSOMetrics.findMany({
    where: { projectId, metric: "DOWNSTREAM_GAS" },
    select: { value: true, tranche: true },
  })
}

export async function blacklistProject(
  projectId: string,
  reason?: string,
  db: PrismaClient = prisma,
) {
  return db.projectBlacklist.upsert({
    where: { projectId },
    update: {
      reason,
      updatedAt: new Date(),
    },
    create: {
      projectId,
      reason,
    },
  })
}

export async function isProjectBlacklisted(
  projectId: string,
  db: PrismaClient = prisma,
) {
  const blacklistEntry = await db.projectBlacklist.findUnique({
    where: { projectId },
  })
  return !!blacklistEntry
}

export async function getEarliestRewardTranche(
  projectId: string,
  roundId: string,
  db: PrismaClient = prisma,
): Promise<number | null> {
  const earliestReward = await db.recurringReward.findFirst({
    where: {
      projectId,
      roundId,
      deletedAt: null,
      amount: {
        not: "0",
      },
    },
    orderBy: {
      tranche: "asc",
    },
    select: {
      tranche: true,
    },
  })

  return earliestReward?.tranche ?? null
}
