"use server"

import { getUserRoleApplication, upsertRoleApplication } from "@/db/role"

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

export async function hasApplied(
  userId: string,
  roleId: number,
): Promise<boolean> {
  const application = await getUserRoleApplication(userId, roleId)
  return application !== null
}
