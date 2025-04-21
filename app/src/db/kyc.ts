import { KYCUser } from "@prisma/client"

import { prisma } from "./client"

export async function updateKYCUserStatus(
  name: string,
  email: string,
  status: string,
  updatedAt: Date,
) {
  const result = await prisma.$queryRaw<KYCUser[]>`
    WITH closest_match AS (
      SELECT id, difference(lower(unaccent("firstName") || ' ' || unaccent("lastName")), lower(unaccent(${name}))) as name_similarity
      FROM "KYCUser" 
      WHERE "email" = ${email.toLowerCase()}
      ORDER BY name_similarity DESC
      LIMIT 1
    )
    UPDATE "KYCUser" SET
      "status" = ${status}::"KYCStatus",
      "updatedAt" = ${updatedAt},
      "expiry" = ${updatedAt} + INTERVAL '1 year'
    WHERE EXISTS (
      SELECT 1 FROM closest_match 
      WHERE closest_match.id = "KYCUser".id
      AND closest_match.name_similarity > 2
    )
    RETURNING *;
  `

  return result
}

export async function updateKYBUserStatus(
  name: string,
  email: string,
  status: string,
  updatedAt: Date,
) {
  const result = await prisma.$queryRaw<KYCUser[]>`
    WITH closest_match AS (
      SELECT id, difference(lower(unaccent("businessName")), lower(unaccent(${name}))) as name_similarity
      FROM "KYCUser" 
      WHERE "email" = ${email.toLowerCase()}
      ORDER BY name_similarity DESC
      LIMIT 1
    )
    UPDATE "KYCUser" SET
      "status" = ${status}::"KYCStatus",
      "updatedAt" = ${updatedAt},
      "expiry" = ${updatedAt} + INTERVAL '1 year'
    WHERE EXISTS (
      SELECT 1 FROM closest_match 
      WHERE closest_match.id = "KYCUser".id
      AND closest_match.name_similarity > 3
    )
    RETURNING *;
  `

  return result
}

export async function getVerifiedKycTeamsMap(projectId: string) {
  const kycTeams = await prisma.projectKYCTeam.findMany({
    where: {
      projectId,
    },
    select: {
      projectId: true,
      team: {
        select: {
          team: {
            select: {
              users: true,
            },
          },
        },
      },
    },
  })

  const result: Record<string, boolean> = {}

  for (const kycTeam of kycTeams) {
    const teamVerified =
      kycTeam.team.team.length > 0 &&
      kycTeam.team.team.every(
        (teamMember) => teamMember.users.status === "APPROVED",
      )

    result[kycTeam.projectId] = teamVerified
  }

  return result
}
