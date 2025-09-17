"use server"

import { KYCUser } from "@prisma/client"

import { prisma } from "./client"
import { UserKYCTeam } from "@/lib/types"
import { resolveProjectStatus } from "@/lib/utils/kyc"

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

// Encapsulate prisma calls for fetching user's KYC team sources (projects and organizations)
export async function getUserKycTeamSources(userId: string) {
  // Fetch user's admin projects with KYC teams
  const adminProjects = await prisma.project.findMany({
    where: {
      team: {
        some: {
          userId,
          role: "admin",
        },
      },
      kycTeamId: {
        not: null,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      kycTeam: {
        include: {
          team: {
            include: {
              users: true,
            },
          },
        },
      },
    },
  })

  // Fetch user's admin organizations with KYC teams
  const adminOrganizations = await prisma.organization.findMany({
    where: {
      team: {
        some: {
          userId,
          role: "admin",
        },
      },
      OrganizationKYCTeams: {
        some: {
          deletedAt: null,
        },
      },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      OrganizationKYCTeams: {
        where: {
          deletedAt: null,
        },
        include: {
          team: {
            include: {
              team: {
                include: {
                  users: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return { adminProjects, adminOrganizations }
}

export async function getUserKycTeams(userId: string): Promise<UserKYCTeam[]> {
  const { adminProjects, adminOrganizations } = await getUserKycTeamSources(userId)

  const kycTeams: UserKYCTeam[] = []

  // Process project KYC teams
  for (const project of adminProjects) {
    if (project.kycTeam) {
      const users = project.kycTeam.team.map((teamMember) => ({
        id: teamMember.users.id,
        status: teamMember.users.status,
        updatedAt: teamMember.users.updatedAt,
      }))

      const status = resolveProjectStatus(users) as
        | "PENDING"
        | "APPROVED"
        | "project_issue"

      kycTeams.push({
        id: project.kycTeam.id,
        walletAddress: project.kycTeam.walletAddress,
        createdAt: project.kycTeam.createdAt,
        updatedAt: project.kycTeam.updatedAt,
        projectId: project.id,
        projectName: project.name,
        users,
        status,
      })
    }
  }

  // Process organization KYC teams
  for (const organization of adminOrganizations) {
    for (const orgKycTeam of organization.OrganizationKYCTeams) {
      const users = orgKycTeam.team.team.map((teamMember) => ({
        id: teamMember.users.id,
        status: teamMember.users.status,
        updatedAt: teamMember.users.updatedAt,
      }))

      const { resolveProjectStatus } = await import("@/lib/utils/kyc")
      const status = resolveProjectStatus(users) as
        | "PENDING"
        | "APPROVED"
        | "project_issue"

      kycTeams.push({
        id: orgKycTeam.team.id,
        walletAddress: orgKycTeam.team.walletAddress,
        createdAt: orgKycTeam.team.createdAt,
        updatedAt: orgKycTeam.team.updatedAt,
        organizationId: organization.id,
        organizationName: organization.name,
        users,
        status,
      })
    }
  }

  return kycTeams
}

