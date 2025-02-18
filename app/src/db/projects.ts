"use server"

import { Prisma, Project, PublishedContract } from "@prisma/client"
import { cache } from "react"
import { Address, getAddress } from "viem"

import {
  ApplicationWithDetails,
  ProjectContracts,
  ProjectContractWithProject,
  ProjectTeam,
  ProjectWithFullDetails,
  ProjectWithTeam,
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
        COALESCE(jsonb_agg(DISTINCT to_jsonb(t.*) || jsonb_build_object(
          'user', to_jsonb(u.*)
        )) FILTER (WHERE t."id" IS NOT NULL), '[]'::jsonb) as "team",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(r.*)) FILTER (WHERE r."id" IS NOT NULL), '[]'::jsonb) as "repos",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(f.*)) FILTER (WHERE f."id" IS NOT NULL), '[]'::jsonb) as "funding",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(s.*)) FILTER (WHERE s."id" IS NOT NULL), '[]'::jsonb) as "snapshots",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(l.*)) FILTER (WHERE l."id" IS NOT NULL), '[]'::jsonb) as "links",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(a.*)) FILTER (WHERE a."id" IS NOT NULL), '[]'::jsonb) as "applications",
        COALESCE(jsonb_agg(
          DISTINCT to_jsonb(fr.*) || jsonb_build_object(
            'claim', to_jsonb(rc.*)
          )
        ) FILTER (WHERE fr."id" IS NOT NULL), '[]'::jsonb) as "rewards",
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
      LEFT JOIN "ProjectRepository" r ON p."id" = r."projectId"
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
        COALESCE(jsonb_agg(DISTINCT to_jsonb(t.*) || jsonb_build_object(
          'user', to_jsonb(u.*)
        )) FILTER (WHERE t."id" IS NOT NULL), '[]'::jsonb) as "team",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(r.*)) FILTER (WHERE r."id" IS NOT NULL), '[]'::jsonb) as "repos",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(f.*)) FILTER (WHERE f."id" IS NOT NULL), '[]'::jsonb) as "funding",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(s.*)) FILTER (WHERE s."id" IS NOT NULL), '[]'::jsonb) as "snapshots",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(l.*)) FILTER (WHERE l."id" IS NOT NULL), '[]'::jsonb) as "links",
        COALESCE(jsonb_agg(DISTINCT to_jsonb(a.*)) FILTER (WHERE a."id" IS NOT NULL), '[]'::jsonb) as "applications",
        COALESCE(jsonb_agg(
          DISTINCT to_jsonb(fr.*) || jsonb_build_object(
            'claim', to_jsonb(rc.*)
          )
        ) FILTER (WHERE fr."id" IS NOT NULL), '[]'::jsonb) as "rewards",
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
      LEFT JOIN "ProjectRepository" r ON p."id" = r."projectId"
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
          DISTINCT to_jsonb(fr.*) || 
          jsonb_build_object(
            'claim', to_jsonb(rc.*)
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

export const getAllPublishedUserProjects = cache(getAllPublishedUserProjectsFn)

async function getProjectFn({
  id,
}: {
  id: string
}): Promise<ProjectWithFullDetails | null> {
  const result = await prisma.$queryRaw<{ result: ProjectWithFullDetails }[]>`
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
        COALESCE(jsonb_agg(DISTINCT to_jsonb(t.*) || jsonb_build_object(
          'user', to_jsonb(u.*)
        )) FILTER (WHERE t."id" IS NOT NULL AND t."deletedAt" IS NULL), '[]'::jsonb) as "team",
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
            'organization', to_jsonb(o.*) || jsonb_build_object(
              'team', COALESCE(jsonb_agg(DISTINCT to_jsonb(ot.*) || jsonb_build_object(
                'user', to_jsonb(ou.*)
              )) FILTER (WHERE ot."id" IS NOT NULL AND ot."deletedAt" IS NULL), '[]'::jsonb)
            )
          )
          ELSE NULL
        END as "organization"
      FROM "Project" p
      LEFT JOIN "UserProjects" t ON p."id" = t."projectId"
      LEFT JOIN "User" u ON t."userId" = u."id"
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
      LEFT JOIN "UserOrganization" ot ON o."id" = ot."organizationId"
      LEFT JOIN "User" ou ON ot."userId" = ou."id"
      WHERE p."id" = ${id}
      GROUP BY p."id", po."id", o."id", o."name"
    )
    SELECT to_jsonb(pd.*) as result
    FROM project_data pd;
  `

  // console.log("result[0]?.result", result[0]?.result)

  return result[0]?.result
}

export const getProject = cache(getProjectFn)

async function getProjectTeamFn({
  id,
}: {
  id: string
}): Promise<ProjectWithTeam | null> {
  const result = await prisma.$queryRaw<{ result: ProjectWithTeam }[]>`
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

export const getProjectTeam = cache(getProjectTeamFn)

async function getConsolidatedProjectTeamFn({
  projectId,
}: {
  projectId: string
}): Promise<ProjectTeam | null> {
  const result = await prisma.$queryRaw<{ result: ProjectTeam }[]>`
    WITH project_data AS (
      SELECT 
        p.*,
        COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', t."id",
            'role', t."role",
            'projectId', t."projectId",
            'user', ARRAY[to_jsonb(u.*)]
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
            'user', ARRAY[to_jsonb(u.*)]
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
      SELECT jsonb_build_object(
        'id', r.result->>'id',
        'name', r.result->>'name',
        'team', r.result->'team'
      ) as result
      FROM result r
    ) final;
  `

  return result[0]?.result
}

export const getConsolidatedProjectTeam = cache(getConsolidatedProjectTeamFn)

async function getAllProjectContractsFn({ projectId }: { projectId: string }) {
  return prisma.projectContract.findMany({
    where: {
      projectId: projectId,
    },
  })
}

export const getAllProjectContracts = cache(getAllProjectContractsFn)

async function getProjectContractsByDeployerFn({
  projectId,
  deployerAddress,
}: {
  projectId: string
  deployerAddress: string
}): Promise<ProjectContractWithProject[]> {
  const result = await prisma.$queryRaw<
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
  getProjectContractsByDeployerFn,
)

async function getProjectContractsFn({
  projectId,
}: {
  projectId: string
}): Promise<ProjectContracts | null> {
  return prisma.project.findFirst({
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

export const getProjectContracts = cache(getProjectContractsFn)

async function getPublishedProjectContractsFn({
  contacts,
}: {
  contacts: {
    chainId: number
    contractAddress: string
  }[]
}): Promise<PublishedContract[]> {
  if (contacts.length === 0) {
    return []
  }

  return prisma.publishedContract.findMany({
    where: {
      AND: [
        {
          OR: contacts.map((c) => ({
            AND: [{ contract: c.contractAddress }, { chainId: c.chainId }],
          })),
        },
        {
          revokedAt: null,
        },
      ],
    },
  })
}

export const getPublishedProjectContracts = cache(
  getPublishedProjectContractsFn,
)

async function getUserApplicationsFn({
  userId,
  roundId,
}: {
  userId: string
  roundId?: string
}): Promise<ApplicationWithDetails[]> {
  const result = await prisma.$queryRaw<{ result: ApplicationWithDetails[] }[]>`
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
  return prisma.$transaction(async (tx) => {
    const updatedProject = await tx.project.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    })
    const deletedRepositories = await tx.projectRepository.deleteMany({
      where: { projectId: id },
    })

    return { updatedProject, deletedRepositories }
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

export async function addProjectContracts(
  projectId: string,
  contracts: Omit<Prisma.ProjectContractCreateManyInput, "project">[],
) {
  const createOperations = contracts.map(async (contract) => {
    try {
      const result = await prisma.projectContract.create({
        data: {
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

  await prisma.project.update({
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

export async function addProjectContract({
  projectId,
  contract,
}: {
  projectId: string
  contract: Omit<Prisma.ProjectContractCreateInput, "project">
}) {
  const contractCreate = prisma.projectContract.upsert({
    where: {
      contractAddress_chainId: {
        contractAddress: contract.contractAddress,
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
  contractAddress: Address
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

export async function removeProjectContractsByDeployer(
  projectId: string,
  deployer: string,
) {
  const contractDelete = prisma.projectContract.deleteMany({
    where: {
      projectId: projectId,
      deployerAddress: getAddress(deployer),
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
        contractAddress: getAddress(address),
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
) {
  return prisma.publishedContract.createMany({
    data: contracts,
  })
}

export async function revokePublishedContracts(attestationIds: string[]) {
  return prisma.publishedContract.updateMany({
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
      projectDescriptionOptions: [],
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
      category: categoryId
        ? {
            connect: {
              id: categoryId,
            },
          }
        : undefined,
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
}

async function getAllApplicationsForRoundFn({
  roundId,
}: {
  roundId: string
}): Promise<ApplicationWithDetails[]> {
  const applications = await prisma.application.findMany({
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

export const getAllApplicationsForRound = cache(getAllApplicationsForRoundFn)

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
      verificationProof: contract.verificationProof ?? "0x0",
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
