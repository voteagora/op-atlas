"use server"

import { Prisma, User } from "@prisma/client"
import { cache } from "react"

import { UserAddressSource } from "@/lib/types"

import { prisma } from "./client"

async function getUserByIdFn(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      addresses: true,
      interaction: true,
    },
  })
}

export const getUserById = cache(getUserByIdFn)

async function getUserByFarcasterIdFn(farcasterId: string) {
  return prisma.user.findUnique({
    where: {
      farcasterId,
    },
    include: {
      addresses: true,
    },
  })
}

export const getUserByFarcasterId = cache(getUserByFarcasterIdFn)

async function searchUsersByUsernameFn({ username }: { username: string }) {
  return prisma.user.findMany({
    where: {
      username: {
        contains: username,
      },
    },
  })
}

export const searchUsersByUsername = cache(searchUsersByUsernameFn)

export async function upsertUser({
  farcasterId,
  ...user
}: {
  farcasterId: string
  name?: string | null
  username?: string | null
  imageUrl?: string | null
  bio?: string | null
}) {
  return prisma.user.upsert({
    where: {
      farcasterId,
    },
    update: {
      ...user,
    },
    create: {
      farcasterId,
      ...user,
    },
  })
}

export async function updateUserEmail({
  id,
  email,
}: {
  id: string
  email?: string | null
}) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      email,
    },
  })
}

export async function updateUserHasGithub({
  id,
  notDeveloper = false,
}: {
  id: string
  notDeveloper?: boolean
}) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      notDeveloper,
    },
  })
}

export async function updateUserGithub({
  id,
  github,
}: {
  id: string
  github?: string | null
}) {
  const updates: Partial<User> = {
    github,
  }
  if (github) {
    updates.notDeveloper = false
  }

  return prisma.user.update({
    where: {
      id,
    },
    data: updates,
  })
}

export async function addUserAddresses({
  id,
  addresses,
  source,
}: {
  id: string
  addresses: string[]
  source: UserAddressSource
}) {
  return prisma.userAddress.createMany({
    data: addresses.map((address) => ({
      userId: id,
      address,
      source,
    })),
  })
}

export async function removeUserAddress({
  id,
  address,
}: {
  id: string
  address: string
}) {
  return prisma.userAddress.delete({
    where: {
      address_userId: {
        address,
        userId: id,
      },
    },
  })
}

export async function updateUserInteraction(
  userId: string,
  data: Prisma.UserInteractionUncheckedCreateInput,
) {
  return await prisma.userInteraction.upsert({
    where: { userId },
    update: {
      ...data,
      ...(data.homePageViewCount && { homePageViewCount: { increment: 1 } }),
      ...(data.profileVisitCount && { profileVisitCount: { increment: 1 } }),
    },
    create: { ...data, userId },
  })
}
