"use server"

import { Role, RoleApplication } from "@prisma/client"

import {
  getActiveUserRoleApplications,
  getRoleById,
  getUserRoleApplications,
  upsertRoleApplication,
} from "@/db/role"
import { withImpersonation } from "@/lib/db/sessionContext"
import {
  resolveSessionUserId,
  verifyOrganizationMembership,
} from "@/lib/actions/utils"

async function authorizeRoleApplicationOrganization(
  organizationId: string | undefined,
  sessionUserId: string | null,
  db: Parameters<typeof getRoleById>[1],
) {
  if (!organizationId) {
    return
  }

  if (!sessionUserId) {
    throw new Error("Unauthorized")
  }

  const membership = await verifyOrganizationMembership(
    organizationId,
    sessionUserId,
    db,
  )
  if (membership?.error) {
    throw new Error(membership.error)
  }
}

export async function applyForRole(
  id: number,
  applicationParams: {
    userId?: string
    organizationId?: string
    application: string
  },
) {
  return withImpersonation(
    async ({ db, userId: sessionUserId }) => {
      try {
        if (applicationParams.userId && applicationParams.organizationId) {
          throw new Error("Invalid application target")
        }

        const role = await getRoleById(id, db)
        if (!role) {
          throw new Error("Role not found")
        }
        const now = new Date()
        if (
          (role.startAt && now < new Date(role.startAt)) ||
          (role.endAt && now > new Date(role.endAt))
        ) {
          throw new Error("Application window is closed")
        }

        await authorizeRoleApplicationOrganization(
          applicationParams.organizationId,
          sessionUserId,
          db,
        )

        const resolution = resolveSessionUserId(
          sessionUserId,
          applicationParams.userId,
        )
        const resolvedUserId = resolution.userId

        if (
          (!applicationParams.organizationId &&
            (resolution.error || !resolvedUserId)) ||
          (!resolvedUserId && !applicationParams.organizationId)
        ) {
          throw new Error("Unauthorized")
        }

        return await upsertRoleApplication(
          id,
          {
            ...applicationParams,
            userId: resolvedUserId,
          },
          db,
        )
      } catch (error) {
        console.error("Error applying for role:", error)
        throw error
      }
    },
    { requireUser: true },
  )
}

export async function getRole(id: number): Promise<Role | null> {
  return withImpersonation(({ db }) => getRoleById(id, db))
}

export async function activeUserApplications(
  userId?: string,
  organizationId?: string,
): Promise<RoleApplication[]> {
  return withImpersonation(
    async ({ db, userId: sessionUserId }) => {
      await authorizeRoleApplicationOrganization(
        organizationId,
        sessionUserId,
        db,
      )

      const resolution = resolveSessionUserId(sessionUserId, userId)
      const resolvedUserId = organizationId
        ? userId
          ? resolution.userId
          : undefined
        : resolution.userId

      if (
        (userId && (resolution.error || !resolution.userId)) ||
        (!resolvedUserId && !organizationId)
      ) {
        throw new Error("Unauthorized")
      }

      return getActiveUserRoleApplications(resolvedUserId, organizationId, db)
    },
    { requireUser: true },
  )
}

export async function getAllUserRoleApplications(
  userId?: string,
  organizationId?: string,
): Promise<RoleApplication[]> {
  return withImpersonation(
    async ({ db, userId: sessionUserId }) => {
      await authorizeRoleApplicationOrganization(
        organizationId,
        sessionUserId,
        db,
      )

      const resolution = resolveSessionUserId(sessionUserId, userId)
      const resolvedUserId = organizationId
        ? userId
          ? resolution.userId
          : undefined
        : resolution.userId

      if (
        (userId && (resolution.error || !resolution.userId)) ||
        (!resolvedUserId && !organizationId)
      ) {
        throw new Error("Unauthorized")
      }

      return getUserRoleApplications(resolvedUserId, organizationId, db)
    },
    { requireUser: true },
  )
}
