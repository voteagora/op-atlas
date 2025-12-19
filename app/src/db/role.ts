"use server"

import { Role, RoleApplication, RoleApplicationStatus } from "@prisma/client"

import { prisma } from "./client"

export async function getAllRoles(): Promise<Role[]> {
  return prisma.role.findMany({
    where: {
      voteEndAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      voteStartAt: "asc",
    },
  })
}

export async function getRoleById(id: number): Promise<Role | null> {
  return prisma.role.findUnique({
    where: {
      id,
    },
  })
}

export async function getUserRoleApplication(
  userId: string,
  roleId: number,
): Promise<RoleApplication | null> {
  return prisma.roleApplication.findFirst({
    where: {
      userId,
      roleId,
    },
  })
}

export async function getRoleApplications(
  roleId: number,
): Promise<RoleApplication[]> {
  return prisma.roleApplication.findMany({
    where: { roleId },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getRoleApplicationById(
  id: number,
): Promise<RoleApplication | null> {
  return prisma.roleApplication.findUnique({
    where: { id },
  })
}

export async function getActiveUserRoleApplications(
  userId?: string,
  organizationId?: string,
): Promise<RoleApplication[]> {
  if (!userId && !organizationId) {
    throw new Error("Either userId or organizationId must be provided")
  }

  const applications = await prisma.roleApplication.findMany({
    where: {
      ...(userId && { userId }),
      ...(organizationId && { organizationId }),
      role: {
        startAt: {
          lte: new Date(),
        },
        voteEndAt: {
          gte: new Date(),
        },
      },
    },
  })

  return applications
}

export async function getUserRoleApplications(
  userId?: string,
  organizationId?: string,
): Promise<RoleApplication[]> {
  if (!userId && !organizationId) {
    throw new Error("Either userId or organizationId must be provided")
  }

  const applications = await prisma.roleApplication.findMany({
    where: {
      ...(userId && { userId }),
      ...(organizationId && { organizationId }),
    },
  })

  return applications
}
