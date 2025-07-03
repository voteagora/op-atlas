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
