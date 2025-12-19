"use server"

import { Role, RoleApplication } from "@prisma/client"

import {
  getActiveUserRoleApplications,
  getRoleApplications,
  getRoleById,
  getUserRoleApplications,
} from "@/db/role"

export async function getRole(id: number): Promise<Role | null> {
  return await getRoleById(id)
}

export async function activeUserApplications(
  userId?: string,
  organizationId?: string,
): Promise<RoleApplication[]> {
  return await getActiveUserRoleApplications(userId, organizationId)
}

export async function getAllUserRoleApplications(
  userId?: string,
  organizationId?: string,
): Promise<RoleApplication[]> {
  return await getUserRoleApplications(userId, organizationId)
}
