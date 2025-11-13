"use server"

import { Role, RoleApplication } from "@prisma/client"

import {
  getActiveUserRoleApplications,
  getRoleApplications,
  getRoleById,
  getUserRoleApplications,
  upsertRoleApplication,
} from "@/db/role"
import { withImpersonation } from "@/lib/db/sessionContext"

export async function applyForRole(
  id: number,
  applicationParams: {
    userId?: string
    organizationId?: string
    application: string
  },
) {
  return withImpersonation(async ({ db }) => {
    try {
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
      return await upsertRoleApplication(id, applicationParams, db)
    } catch (error) {
      console.error("Error applying for role:", error)
      throw error
    }
  })
}

export async function getRole(id: number): Promise<Role | null> {
  return withImpersonation(({ db }) => getRoleById(id, db))
}

export async function activeUserApplications(
  userId?: string,
  organizationId?: string,
): Promise<RoleApplication[]> {
  return withImpersonation(({ db }) =>
    getActiveUserRoleApplications(userId, organizationId, db),
  )
}

export async function getAllUserRoleApplications(
  userId?: string,
  organizationId?: string,
): Promise<RoleApplication[]> {
  return withImpersonation(({ db }) =>
    getUserRoleApplications(userId, organizationId, db),
  )
}
