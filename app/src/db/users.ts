"use server"

import { Prisma, User } from "@prisma/client"

import { UserAddressSource } from "@/lib/types"

import { prisma } from "./client"

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      addresses: true,
      interaction: true,
      emails: true,
    },
  })
}

export async function getUserByFarcasterId(farcasterId: string) {
  return prisma.user.findUnique({
    where: {
      farcasterId,
    },
    include: {
      addresses: true,
      emails: true,
    },
  })
}

export async function getUserByUsername(username: string) {
  return prisma.user.findFirst({
    where: {
      username,
    },
    include: {
      addresses: true,
      interaction: true,
      emails: true,
    },
  })
}

export async function searchUsersByUsername({
  username,
}: {
  username: string
}) {
  return prisma.user.findMany({
    where: {
      username: {
        contains: username,
      },
    },
  })
}

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
    include: {
      emails: true,
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
  const deleteEmails = prisma.userEmail.deleteMany({
    where: {
      userId: id,
    },
  })

  const createEmail = email
    ? [
        prisma.userEmail.create({
          data: {
            email,
            userId: id,
          },
        }),
      ]
    : []

  return prisma.$transaction([deleteEmails, ...createEmail])
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

export async function updateUserGovForumProfileUrl({
  id,
  govForumProfileUrl,
}: {
  id: string
  govForumProfileUrl?: string | null
}) {
  return prisma.user.update({
    where: { id },
    data: { govForumProfileUrl },
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
