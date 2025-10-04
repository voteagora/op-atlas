"use server"

import { prisma } from "./client"

export async function getUserKYCUser(userId: string) {
  return await prisma.userKYCUser.findFirst({
    where: {
      userId,
      kycUser: {
        expiry: {
          gt: new Date(),
        },
      },
    },
    include: {
      kycUser: true,
    },
  })
}

export async function createUserKYCUser(userId: string, kycUserId: string) {
  return await prisma.userKYCUser.create({
    data: {
      userId,
      kycUserId,
    },
  })
}

export async function getUserPersonalKYC(userId: string) {
  const userKyc = await prisma.userKYCUser.findFirst({
    where: {
      userId,
    },
    include: {
      kycUser: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return userKyc?.kycUser || null
}

export async function getKYCUserStatus(userId: string) {
  return await prisma.userKYCUser.findFirst({
    where: {
      userId,
    },
    select: {
      kycUser: {
        select: {
          status: true,
        },
      },
    },
  })
}

export interface LinkOrphanedKYCResult {
  linked: boolean
  reason?: "invalid-email" | "no-user" | "already-linked" | "not-found" | "link-failed"
}

export async function linkOrphanedKYCUserToUser(userId: string, email: string): Promise<LinkOrphanedKYCResult> {
  if (!email || !email.trim()) {
    return { linked: false, reason: "invalid-email" }
  }

  if (!userId) {
    return { linked: false, reason: "no-user" }
  }

  const normalizedEmail = email.trim().toLowerCase()

  // Skip if the user already has a non-expired KYC linked
  const existingUserKYC = await getUserKYCUser(userId)
  if (existingUserKYC) {
    return { linked: false, reason: "already-linked" }
  }

  const orphanedKYCUser = await prisma.kYCUser.findFirst({
    where: {
      email: normalizedEmail,
      expiry: {
        gt: new Date(),
      },
      UserKYCUsers: {
        none: {},
      },
    },
  })

  if (!orphanedKYCUser) {
    return { linked: false, reason: "not-found" }
  }

  try {
    await prisma.userKYCUser.create({
      data: {
        userId,
        kycUserId: orphanedKYCUser.id,
      },
    })

    return { linked: true }
  } catch (error) {
    console.error("Failed to link orphaned KYC user:", error)
    return { linked: false, reason: "link-failed" }
  }
}
