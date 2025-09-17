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