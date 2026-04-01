"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { deleteKycTeam, getUserKycTeamSources } from "@/db/kyc"
import { getKYCUsersByProjectId as getKYCUsersByProjId } from "@/db/kyc"
import { withImpersonation } from "@/lib/db/sessionContext"
import { toProjectKycUsersDTO } from "@/lib/dto"
import { resolveProjectStatus } from "@/lib/utils/kyc"
import { UserKYCTeam } from "@/lib/types"
import { KYCStatus } from "@prisma/client"

import {
  resolveSessionUserId,
  verifyMembership,
  verifyAdminStatus,
  verifyOrganizationMembership,
  verifyOrganizationAdmin,
} from "./utils"

export const deleteKYCTeamAction = async ({
  projectId,
  organizationId,
  kycTeamId,
  hasActiveStream,
}: {
  projectId?: string
  organizationId?: string
  kycTeamId: string
  hasActiveStream?: boolean
}) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      if (projectId) {
        const isInvalid = await verifyAdminStatus(projectId, userId)
        if (isInvalid?.error) {
          throw new Error(isInvalid.error)
        }
      } else if (organizationId) {
        const isInvalid = await verifyOrganizationAdmin(organizationId, userId)
        if (isInvalid?.error) {
          throw new Error(isInvalid.error)
        }
      } else {
        throw new Error("No project or organization provided")
      }

      const result = await deleteKycTeam(
        {
          kycTeamId,
          hasActiveStream,
        },
        db,
      )

      if (projectId) {
        revalidatePath(`/projects/${projectId}/grant-address`)
      }
      if (organizationId) {
        revalidatePath(`/profile/organizations/${organizationId}/grant-address`)
      }

      return result
    },
    { requireUser: true },
  )

export const getKYCUsersByProjectId = async (projectId: string) =>
  withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const isInvalid = await verifyAdminStatus(projectId, userId)
      if (isInvalid?.error) {
        throw new Error(isInvalid.error)
      }

      const payload = await getKYCUsersByProjId({ projectId }, db)
      return toProjectKycUsersDTO(payload, "admin")
    },
    { requireUser: true },
  )

export async function getUserKycTeams(
  targetUserId?: string,
): Promise<UserKYCTeam[]> {
  return withImpersonation(async ({ db, userId: sessionUserId }) => {
    const resolution = resolveSessionUserId(sessionUserId, targetUserId)
    if (resolution.error || !resolution.userId) {
      throw new Error("Unauthorized")
    }

    const userId = resolution.userId

    const { adminProjects, adminOrganizations } = await getUserKycTeamSources(
      userId,
      db,
    )

    const kycTeams: UserKYCTeam[] = []

    for (const project of adminProjects) {
      if (project.kycTeam) {
        const users = project.kycTeam.team.map((teamMember) => ({
          id: teamMember.users.id,
          status: teamMember.users.status,
          expiry: teamMember.users.expiry,
          updatedAt: teamMember.users.updatedAt,
        }))

        const status = resolveProjectStatus(users) as
          | "PENDING"
          | "APPROVED"
          | "EXPIRED"
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

    for (const organization of adminOrganizations) {
      for (const orgKycTeam of organization.OrganizationKYCTeams) {
        const users = orgKycTeam.team.team.map((teamMember) => ({
          id: teamMember.users.id,
          status: teamMember.users.status,
          expiry: teamMember.users.expiry,
          updatedAt: teamMember.users.updatedAt,
        }))

        const status = resolveProjectStatus(users) as
          | "PENDING"
          | "APPROVED"
          | "EXPIRED"
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
  })
}

async function fetchExistingLegalEntities(db: PrismaClient, kycTeamId: string) {
  try {
    if (!kycTeamId) {
      console.warn("getExistingLegalEntities: missing kycTeamId")
      return []
    }

    console.debug("getExistingLegalEntities:start", { kycTeamId })

    const links = await db.kYCLegalEntityTeams.findMany({
      where: { kycTeamId },
      include: {
        legalEntity: {
          include: {
            kycLegalEntityController: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    console.debug("getExistingLegalEntities:linksFetched", {
      count: links.length,
    })

    const now = new Date()

    const mapped = links
      .map((l) => l.legalEntity)
      .filter((e): e is NonNullable<typeof e> => Boolean(e))

    const filtered = mapped.filter(
      (e) => e.status === KYCStatus.APPROVED && (!e.expiry || e.expiry > now),
    )

    if (mapped.length !== filtered.length) {
      const dropped = mapped.length - filtered.length
      console.debug("getExistingLegalEntities:filteredOut", {
        total: mapped.length,
        approvedAndValid: filtered.length,
        dropped,
      })
    }

    const items = filtered.map((e) => ({
      id: e.id,
      businessName: e.name,
      controllerFirstName: e.kycLegalEntityController?.firstName || "",
      controllerLastName: e.kycLegalEntityController?.lastName || "",
      controllerEmail: e.kycLegalEntityController?.email || "",
      expiresAt: e.expiry ?? null,
    }))

    console.debug("getExistingLegalEntities:itemsPrepared", {
      count: items.length,
    })

    return items
  } catch (e) {
    console.error("getExistingLegalEntities error", e)
    return []
  }
}

export async function getExistingLegalEntities(
  kycTeamId: string,
  db?: PrismaClient,
) {
  if (db) {
    return fetchExistingLegalEntities(db, kycTeamId)
  }

  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const [projectLink, organizationLink] = await Promise.all([
        db.project.findFirst({
          where: { kycTeamId },
          select: { id: true },
        }),
        db.organizationKYCTeam.findFirst({
          where: { kycTeamId },
          select: { organizationId: true },
        }),
      ])

      const projectId = projectLink?.id
      const organizationId = organizationLink?.organizationId

      const projectAdmin = projectId
        ? await verifyAdminStatus(projectId, userId, db)
        : null
      const organizationAdmin = organizationId
        ? await verifyOrganizationAdmin(organizationId, userId, db)
        : null

      const isAdmin =
        (!!projectId && !projectAdmin?.error) ||
        (!!organizationId && !organizationAdmin?.error)

      if (!isAdmin) {
        const projectMembership = projectId
          ? await verifyMembership(projectId, userId, db)
          : null
        const organizationMembership = organizationId
          ? await verifyOrganizationMembership(organizationId, userId, db)
          : null

        if (
          (!projectId || projectMembership?.error) &&
          (!organizationId || organizationMembership?.error)
        ) {
          throw new Error("Unauthorized")
        }
      }

      const items = await fetchExistingLegalEntities(db, kycTeamId)
      if (isAdmin) {
        return items
      }

      return items.map((item) => ({
        ...item,
        controllerEmail: "",
      }))
    },
    { requireUser: true },
  )
}

// Fetch distinct, approved, unexpired legal entities associated with any KYCTeam
// linked to the given organization (to populate reusable entities list).
async function fetchAvailableLegalEntitiesForOrganization(
  db: PrismaClient,
  organizationId: string,
) {
  try {
    if (!organizationId) {
      console.warn(
        "getAvailableLegalEntitiesForOrganization: missing organizationId",
      )
      return []
    }
    console.debug("getAvailableLegalEntitiesForOrganization:start", {
      organizationId,
    })

    // 1) Find all KYCTeams linked to this organization
    const orgTeams = await db.organizationKYCTeam.findMany({
      where: { organizationId },
      select: { kycTeamId: true },
    })
    const kycTeamIds = orgTeams.map((t) => t.kycTeamId)
    console.debug("getAvailableLegalEntitiesForOrganization:orgTeamsFetched", {
      teamCount: kycTeamIds.length,
    })

    if (kycTeamIds.length === 0) {
      return []
    }

    // 2) Fetch all links from those teams to legal entities
    const links = await db.kYCLegalEntityTeams.findMany({
      where: { kycTeamId: { in: kycTeamIds } },
      include: {
        legalEntity: {
          include: { kycLegalEntityController: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    console.debug("getAvailableLegalEntitiesForOrganization:linksFetched", {
      count: links.length,
    })

    const now = new Date()

    // 3) Map links to legal entities, filter out rejected + expired, and dedupe by id
    const approvedValid = links
      .map((l) => l.legalEntity)
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
      .filter(
        (e) =>
          e.status !== KYCStatus.REJECTED &&
          e.status !== KYCStatus.PENDING_REVIEW &&
          (!e.expiry || e.expiry > now),
      )

    // Dedupe by id
    const seen = new Set<string>()
    const deduped = approvedValid.filter((e) => {
      if (seen.has(e.id)) return false
      seen.add(e.id)
      return true
    })

    const items = deduped.map((e) => ({
      id: e.id,
      businessName: e.name,
      controllerFirstName: e.kycLegalEntityController?.firstName || "",
      controllerLastName: e.kycLegalEntityController?.lastName || "",
      controllerEmail: e.kycLegalEntityController?.email || "",
      expiresAt: e.expiry ?? null,
    }))

    console.debug("getAvailableLegalEntitiesForOrganization:itemsPrepared", {
      count: items.length,
    })
    return items
  } catch (e) {
    console.error("getAvailableLegalEntitiesForOrganization error", e)
    return []
  }
}

export async function getAvailableLegalEntitiesForOrganization(
  organizationId: string,
  db?: PrismaClient,
) {
  if (db) {
    return fetchAvailableLegalEntitiesForOrganization(db, organizationId)
  }

  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        throw new Error("Unauthorized")
      }

      const [adminStatus, membership] = await Promise.all([
        verifyOrganizationAdmin(organizationId, userId, db),
        verifyOrganizationMembership(organizationId, userId, db),
      ])

      if (membership?.error) {
        throw new Error(membership.error)
      }

      const items = await fetchAvailableLegalEntitiesForOrganization(
        db,
        organizationId,
      )
      if (!adminStatus?.error) {
        return items
      }

      return items.map((item) => ({
        ...item,
        controllerEmail: "",
      }))
    },
    { requireUser: true },
  )
}

// Fetch all selected legal entities for a KYCTeam, regardless of approval/expiry,
// to drive the Legal Entities status list in the KYC status UI.
async function fetchSelectedLegalEntitiesForTeam(
  db: PrismaClient,
  kycTeamId: string,
) {
  try {
    if (!kycTeamId) return []

    const links = await db.kYCLegalEntityTeams.findMany({
      where: { kycTeamId },
      include: {
        legalEntity: {
          include: {
            kycLegalEntityController: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return links
      .map((l) => l.legalEntity)
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
      .map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        expiry: e.expiry ?? null,
        controllerFirstName: e.kycLegalEntityController?.firstName || "",
        controllerLastName: e.kycLegalEntityController?.lastName || "",
        controllerEmail: e.kycLegalEntityController?.email || "",
      }))
  } catch (e) {
    console.error("getSelectedLegalEntitiesForTeam error", e)
    return []
  }
}

export async function getSelectedLegalEntitiesForTeam(
  kycTeamId: string,
  db?: PrismaClient,
) {
  if (db) {
    return fetchSelectedLegalEntitiesForTeam(db, kycTeamId)
  }

  return withImpersonation(({ db }) =>
    fetchSelectedLegalEntitiesForTeam(db, kycTeamId),
  )
}

export async function restartKYCForExpiredUser({
  kycUserId,
  kycTeamId,
  projectId,
  organizationId,
}: {
  kycUserId: string
  kycTeamId: string
  projectId?: string
  organizationId?: string
}) {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return { error: "Unauthorized" }
      }

      if (projectId) {
        const isInvalid = await verifyAdminStatus(projectId, userId)
        if (isInvalid?.error) return isInvalid
      } else if (organizationId) {
        const isInvalid = await verifyOrganizationAdmin(organizationId, userId)
        if (isInvalid?.error) return isInvalid
      } else {
        return { error: "Project or organization ID required" }
      }

      try {
        const oldUser = await db.kYCUser.findUnique({
          where: { id: kycUserId },
          include: { KYCUserTeams: true, UserKYCUsers: true },
        })

        if (!oldUser) {
          return { error: "KYC user not found" }
        }

        if (!oldUser.expiry || oldUser.expiry > new Date()) {
          return { error: "KYC user is not expired" }
        }

        const newUser = await db.$transaction(async (tx) => {
          const created = await tx.kYCUser.create({
            data: {
              email: oldUser.email,
              firstName: oldUser.firstName,
              lastName: oldUser.lastName,
              status: "PENDING",
              expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          })

          await tx.kYCUserTeams.create({
            data: {
              kycUserId: created.id,
              kycTeamId,
            },
          })

          await tx.kYCUserTeams.deleteMany({
            where: {
              kycUserId: oldUser.id,
              kycTeamId,
            },
          })

          if (oldUser.UserKYCUsers.length > 0) {
            await tx.userKYCUser.createMany({
              data: oldUser.UserKYCUsers.map((link) => ({
                userId: link.userId,
                kycUserId: created.id,
              })),
              skipDuplicates: true,
            })
          }

          return created
        })

        const { sendKYCStartedEmail } = await import("@/lib/email/send")
        await sendKYCStartedEmail(newUser)

        if (projectId) {
          revalidatePath(`/projects/${projectId}/grant-address`)
        } else if (organizationId) {
          revalidatePath(
            `/profile/organizations/${organizationId}/grant-address`,
          )
        }

        return { success: true, user: newUser }
      } catch (error) {
        console.error("Error restarting KYC:", error)
        return { error: "Failed to restart KYC" }
      }
    },
    { requireUser: true },
  )
}

export async function restartKYCForExpiredLegalEntity({
  legalEntityId,
  kycTeamId,
  projectId,
  organizationId,
}: {
  legalEntityId: string
  kycTeamId: string
  projectId?: string
  organizationId?: string
}) {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return { error: "Unauthorized" }
      }

      if (projectId) {
        const isInvalid = await verifyAdminStatus(projectId, userId)
        if (isInvalid?.error) return isInvalid
      } else if (organizationId) {
        const isInvalid = await verifyOrganizationAdmin(organizationId, userId)
        if (isInvalid?.error) return isInvalid
      } else {
        return { error: "Project or organization ID required" }
      }

      try {
        const oldEntity = await db.kYCLegalEntity.findUnique({
          where: { id: legalEntityId },
          include: {
            kycLegalEntityController: true,
          },
        })

        if (!oldEntity) {
          return { error: "Legal entity not found" }
        }

        if (!oldEntity.expiry || oldEntity.expiry > new Date()) {
          return { error: "Legal entity is not expired" }
        }

        const newEntity = await db.$transaction(async (tx) => {
          const created = await tx.kYCLegalEntity.create({
            data: {
              name: oldEntity.name,
              status: "PENDING",
              expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              kycLegalEntityController: {
                create: {
                  firstName:
                    oldEntity.kycLegalEntityController?.firstName || "",
                  lastName: oldEntity.kycLegalEntityController?.lastName || "",
                  email:
                    oldEntity.kycLegalEntityController?.email?.toLowerCase() ||
                    "",
                },
              },
            },
          })

          await tx.kYCLegalEntityTeams.create({
            data: {
              kycTeamId,
              legalEntityId: created.id,
            },
          })

          await tx.kYCLegalEntityTeams.deleteMany({
            where: {
              kycTeamId,
              legalEntityId,
            },
          })

          return created
        })

        const { sendKYBStartedEmail } = await import("@/lib/email/send")
        await sendKYBStartedEmail(newEntity as any)

        if (projectId) {
          revalidatePath(`/projects/${projectId}/grant-address`)
        } else if (organizationId) {
          revalidatePath(
            `/profile/organizations/${organizationId}/grant-address`,
          )
        }

        return { success: true, legalEntity: newEntity }
      } catch (error) {
        console.error("Error restarting legal entity KYC:", error)
        return { error: "Failed to restart legal entity KYC" }
      }
    },
    { requireUser: true },
  )
}

export async function restartAllExpiredKYCForTeam({
  kycTeamId,
  projectId,
  organizationId,
}: {
  kycTeamId: string
  projectId?: string
  organizationId?: string
}) {
  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return { error: "Unauthorized" }
      }

      if (projectId) {
        const isInvalid = await verifyAdminStatus(projectId, userId)
        if (isInvalid?.error) return isInvalid
      } else if (organizationId) {
        const isInvalid = await verifyOrganizationAdmin(organizationId, userId)
        if (isInvalid?.error) return isInvalid
      } else {
        return { error: "Project or organization ID required" }
      }

      try {
        const expiredUsers = await db.kYCUser.findMany({
          where: {
            KYCUserTeams: {
              some: {
                kycTeamId,
              },
            },
            status: "APPROVED",
            expiry: {
              lte: new Date(),
            },
          },
        })

        for (const user of expiredUsers) {
          await restartKYCForExpiredUser({
            kycUserId: user.id,
            kycTeamId,
            projectId,
            organizationId,
          })
        }

        const expiredEntities = await db.kYCLegalEntity.findMany({
          where: {
            teamLinks: {
              some: {
                kycTeamId,
              },
            },
            status: "APPROVED",
            expiry: {
              lte: new Date(),
            },
          },
        })

        for (const entity of expiredEntities) {
          await restartKYCForExpiredLegalEntity({
            legalEntityId: entity.id,
            kycTeamId,
            projectId,
            organizationId,
          })
        }

        if (projectId) {
          revalidatePath(`/projects/${projectId}/grant-address`)
        } else if (organizationId) {
          revalidatePath(
            `/profile/organizations/${organizationId}/grant-address`,
          )
        }

        return {
          success: true,
          restartedUsers: expiredUsers.length,
          restartedEntities: expiredEntities.length,
        }
      } catch (error) {
        console.error("Error restarting all expired KYC:", error)
        return { error: "Failed to restart expired KYC" }
      }
    },
    { requireUser: true },
  )
}
