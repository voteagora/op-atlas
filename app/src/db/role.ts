"use server"

import { Role, RoleApplication, RoleApplicationStatus } from "@prisma/client"

import { prisma } from "./client"

export async function getAllRoles(): Promise<Role[]> {
  return prisma.role.findMany({
    where: {
      endAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      endAt: "asc",
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

export async function upsertRoleApplication(
  id: number,
  applicationParams: {
    userId?: string
    organizationId?: string
    application: string
  },
): Promise<RoleApplication> {
  const { userId, organizationId, application } = applicationParams

  // Check if a role application already exists
  const existingApplication = await prisma.roleApplication.findFirst({
    where: {
      roleId: id,
      ...(userId && { userId }),
      ...(organizationId && { organizationId }),
    },
  })

  if (existingApplication) {
    // Update existing application
    return prisma.roleApplication.update({
      where: {
        id: existingApplication.id,
      },
      data: {
        application,
      },
    })
  } else {
    // Create new application
    return prisma.roleApplication.create({
      data: {
        roleId: id,
        userId,
        organizationId,
        application,
        status: RoleApplicationStatus.pending,
      },
    })
  }
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
        endAt: {
          gte: new Date(),
        },
      },
    },
  })

  return applications
}
