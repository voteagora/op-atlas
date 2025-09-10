"use server"

import { KYCUser } from "@prisma/client"

import { prisma } from "./client"

export async function updateKYCUserStatus(
  parsedStatus: string,
  unparsedPersonaStatus: string,
  updatedAt: Date,
  referenceId?: string,
  expiresAt?: Date | string | null,
) {
  if (!referenceId) {
    throw new Error("Reference ID is required for KYC user status update")
  }

  const result = await prisma.$queryRaw<KYCUser[]>`
    UPDATE "KYCUser" SET
      "status" = ${parsedStatus}::"KYCStatus",
      "personaStatus" = ${unparsedPersonaStatus}::"PersonaStatus",
      "updatedAt" = ${updatedAt},
      "expiry" = COALESCE(${expiresAt}::timestamptz, ${updatedAt} + INTERVAL '1 year')
    WHERE id = ${referenceId}
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
    // Mark any active (draft) GrantEligibility forms linked to this KYC team as deleted
    // This ensures users truly "start over" after removing an address
    await tx.grantEligibility.updateMany({
      where: {
        kycTeamId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })

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

export async function getKYCUsersByProjectId({
  projectId,
}: {
  projectId: string
}) {
  // This query follows the SQL join logic:
  // select * from "Project" p
  // join "KYCUserTeams" kut on kut."kycTeamId" = p."kycTeamId"
  // join "KYCUser" ku on ku.id = kut."kycUserId"
  // where p.id = '...'
  const value = await prisma.kYCUser.findMany({
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
  console.log("getKYCUsersByProjectId: ", { value })
  return value
}
