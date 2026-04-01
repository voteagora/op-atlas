"use server"

import { Role, RoleApplication } from "@prisma/client"

import {
  getActiveUserRoleApplications,
  getRoleById,
  getUserRoleApplications,
  upsertRoleApplication,
} from "@/db/role"
import { withImpersonation } from "@/lib/db/sessionContext"
import { resolveSessionUserId } from "@/lib/actions/utils"

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
        const resolution = resolveSessionUserId(
          sessionUserId,
          applicationParams.userId,
        )
        if (resolution.error || !resolution.userId) {
          throw new Error("Unauthorized")
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
        return await upsertRoleApplication(
          id,
          {
            ...applicationParams,
            userId: resolution.userId,
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
    ({ db, userId: sessionUserId }) => {
      const resolution = resolveSessionUserId(sessionUserId, userId)
      if (resolution.error || !resolution.userId) {
        throw new Error("Unauthorized")
      }

      return getActiveUserRoleApplications(
        resolution.userId,
        organizationId,
        db,
      )
    },
    { requireUser: true },
  )
}

export async function getAllUserRoleApplications(
  userId?: string,
  organizationId?: string,
): Promise<RoleApplication[]> {
  return withImpersonation(
    ({ db, userId: sessionUserId }) => {
      const resolution = resolveSessionUserId(sessionUserId, userId)
      if (resolution.error || !resolution.userId) {
        throw new Error("Unauthorized")
      }

      return getUserRoleApplications(resolution.userId, organizationId, db)
    },
    { requireUser: true },
  )
}
