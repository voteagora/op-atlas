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
      WHERE "email" = ${email.toLowerCase()} AND "businessName" IS NOT NULL
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

  return project?.kycTeam ?? undefined
}

export async function checkWalletAddressExists(walletAddress: string) {
  const existingKycTeam = await prisma.kYCTeam.findUnique({
    where: {
      walletAddress: walletAddress.toLowerCase(),
      deletedAt: null,
    },
  })

  return existingKycTeam !== null
}

export async function getKycTeamByWalletAddress(walletAddress: string) {
  return await prisma.kYCTeam.findUnique({
    where: {
      walletAddress: walletAddress.toLowerCase(),
      deletedAt: null,
    },
    include: {
      team: {
        include: {
          users: true,
        },
      },
      rewardStreams: true,
      projects: {
        include: {
          blacklist: true,
        },
      },
    },
  })
}

export async function deleteKycTeam({
  kycTeamId,
  hasActiveStream,
}: {
  kycTeamId: string
  hasActiveStream?: boolean
}) {
  await prisma.$transaction(async (tx) => {
    // First, get all KYC users that are only associated with this KYC team
    // and don't have APPROVED status (since approved users should be preserved)
    const kycUsersToDelete = await tx.kYCUser.findMany({
      where: {
        KYCUserTeams: {
          every: {
            kycTeamId: kycTeamId,
          },
        },
        status: {
          not: "APPROVED",
        },
      },
      select: {
        id: true,
      },
    })

    // Delete KYCUserTeams relationships for this KYC team
    await tx.kYCUserTeams.deleteMany({
      where: {
        kycTeamId: kycTeamId,
      },
    })

    // Delete KYC users that were only associated with this team
    if (kycUsersToDelete.length > 0) {
      await tx.kYCUser.deleteMany({
        where: {
          id: {
            in: kycUsersToDelete.map((user) => user.id),
          },
        },
      })
    }

    // Finally, delete the KYC team
    if (hasActiveStream) {
      // Soft delete if there's an active stream
      await tx.kYCTeam.update({
        where: {
          id: kycTeamId,
        },
        data: {
          deletedAt: new Date(),
        },
      })
    } else {
      await tx.kYCTeam.delete({
        where: {
          id: kycTeamId,
        },
      })
    }
  })
}

export async function rejectProjectKYC(projectId: string) {
  // Find all KYC users associated with this project
  const kycUsers = await prisma.kYCUser.findMany({
    where: {
      KYCUserTeams: {
        some: {
          team: {
            projects: {
              some: {
                id: projectId,
              },
            },
          },
        },
      },
    },
  })

  // Update all KYC users to REJECTED status
  const updatePromises = kycUsers.map((user) =>
    prisma.kYCUser.update({
      where: { id: user.id },
      data: {
        status: "REJECTED",
        updatedAt: new Date(),
      },
    }),
  )

  await Promise.all(updatePromises)

  return kycUsers.length
}
