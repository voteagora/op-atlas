"use server"

import { Role, RoleApplication } from "@prisma/client"

import {
  getActiveUserRoleApplications,
  getRoleById,
  upsertRoleApplication,
} from "@/db/role"

export async function applyForRole(
  id: number,
  applicationParams: {
    userId?: string
    organizationId?: string
    application: string
  },
) {
  try {
    // Fetch the role to check application window
    const role = await getRoleById(id)
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
    return await upsertRoleApplication(id, applicationParams)
  } catch (error) {
    console.error("Error applying for role:", error)
    throw error
  }
}

export async function getRole(id: number): Promise<Role | null> {
  return await getRoleById(id)
}

export async function activeUserApplications(
  userId?: string,
  organizationId?: string,
): Promise<RoleApplication[]> {
  return await getActiveUserRoleApplications(userId, organizationId)
}
