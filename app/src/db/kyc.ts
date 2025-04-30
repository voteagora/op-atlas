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
      AND closest_match.name_similarity > 2
    )
    RETURNING *;
  `

  return result
}

export async function getProjectKycTeam(projectId: string) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      kycTeamId: true,
      kycTeam: {
        include: {
          team: {
            include: {
              users: true,
            },
          },
          rewardStream: true,
        },
      },
    },
  })

  return project?.kycTeam ?? undefined
}

export async function deleteKycTeam({
  kycTeamId,
  rewardStreamId,
}: {
  kycTeamId: string
  rewardStreamId?: string
}) {
  // Soft delete if there's an active stream
  if (rewardStreamId) {
    await prisma.kYCTeam.update({
      where: {
        id: kycTeamId,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  } else {
    await prisma.kYCTeam.delete({
      where: {
        id: kycTeamId,
      },
    })
  }
}
