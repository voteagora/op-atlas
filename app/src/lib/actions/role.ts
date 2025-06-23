"use server"

import { getActiveUserRoleApplications, upsertRoleApplication } from "@/db/role"

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

export async function activeRoleApplications(
  userId: string,
): Promise<number[]> {
  return await getActiveUserRoleApplications(userId)
}
