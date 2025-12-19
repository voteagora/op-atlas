"use server"

import {
  PrismaClient,
  Role,
  RoleApplication,
  RoleApplicationStatus,
} from "@prisma/client"

import { prisma } from "./client"

export async function getAllRoles(
  db: PrismaClient = prisma,
): Promise<Role[]> {
  return db.role.findMany({
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

export async function getRoleById(
  id: number,
  db: PrismaClient = prisma,
): Promise<Role | null> {
  return db.role.findUnique({
    where: {
      id,
    },
  })
}

export async function getUserRoleApplication(
  userId: string,
  roleId: number,
  db: PrismaClient = prisma,
): Promise<RoleApplication | null> {
  return db.roleApplication.findFirst({
    where: {
      userId,
      roleId,
    },
  })
}

export async function getRoleApplications(
  roleId: number,
  db: PrismaClient = prisma,
): Promise<RoleApplication[]> {
  return db.roleApplication.findMany({
    where: { roleId },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getRoleApplicationById(
  id: number,
  db: PrismaClient = prisma,
): Promise<RoleApplication | null> {
  return db.roleApplication.findUnique({
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
  db: PrismaClient = prisma,
): Promise<RoleApplication> {
  const { userId, organizationId, application } = applicationParams

  // Check if a role application already exists
  const existingApplication = await db.roleApplication.findFirst({
    where: {
      roleId: id,
      ...(userId && { userId }),
      ...(organizationId && { organizationId }),
    },
  })

  if (existingApplication) {
    // Update existing application
    return db.roleApplication.update({
      where: {
        id: existingApplication.id,
      },
      data: {
        application,
      },
    })
  } else {
    // Create new application
    return db.roleApplication.create({
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
  db: PrismaClient = prisma,
): Promise<RoleApplication[]> {
  if (!userId && !organizationId) {
    throw new Error("Either userId or organizationId must be provided")
  }

  const applications = await db.roleApplication.findMany({
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
  db: PrismaClient = prisma,
): Promise<RoleApplication[]> {
  if (!userId && !organizationId) {
    throw new Error("Either userId or organizationId must be provided")
  }

  const applications = await db.roleApplication.findMany({
    where: {
      ...(userId && { userId }),
      ...(organizationId && { organizationId }),
    },
  })

  return applications
}
