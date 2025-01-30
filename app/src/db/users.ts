"use server"

import { Prisma, User } from "@prisma/client"
import { AggregatedType } from "eas-indexer/src/types"

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

export async function updateUserDiscord({
  id,
  discord,
}: {
  id: string
  discord?: string | null
}) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      discord,
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

async function getAllNonTaggedCitizens(records: AggregatedType["citizen"]) {
  return prisma.userAddress.findMany({
    where: {
      AND: [
        {
          address: {
            in: records.map((record) => record.address),
          },
        },
      ],
    },
    select: {
      address: true,
      user: {
        select: {
          emails: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  })
}

async function getAllNonTaggedBadgeholders() {
  return prisma.userAddress.findMany({
    where: {
      NOT: {
        tags: {
          has: "badgeholder",
        },
      },
    },
    select: {
      address: true,
      user: {
        select: {
          emails: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  })
}

async function getAllNonTaggedGovContributors(
  records: AggregatedType["gov_contribution"],
) {
  return prisma.userAddress.findMany({
    where: {
      AND: [
        {
          address: {
            in: records.map((record) => record.address),
          },
        },
      ],
    },
    select: {
      address: true,
      user: {
        select: {
          emails: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  })
}

async function getAllNonTaggedRFVoters(records: AggregatedType["rf_voter"]) {
  return prisma.userAddress.findMany({
    where: {
      AND: [
        {
          address: {
            in: records.map((record) => record.address),
          },
        },
      ],
    },
    select: {
      address: true,
      user: {
        select: {
          emails: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  })
}

export async function getAggregatedRecords(records: AggregatedType) {
  const [citizen, badgeholder, gov_contribution, rf_voter] = await Promise.all([
    getAllNonTaggedCitizens(records.citizen),
    getAllNonTaggedBadgeholders(),
    getAllNonTaggedGovContributors(records.gov_contribution),
    getAllNonTaggedRFVoters(records.rf_voter),
  ])

  const result = {
    citizen: citizen.map((c) => ({
      address: c.address,
      email: c.user.emails.at(-1)?.email ?? "",
    })),
    badgeholder: badgeholder.map((b) => ({
      address: b.address,
      email: b.user.emails.at(-1)?.email ?? "",
    })),
    gov_contribution: gov_contribution.map((g) => ({
      address: g.address,
      email: g.user.emails.at(-1)?.email ?? "",
    })),
    rf_voter: rf_voter.map((r) => ({
      address: r.address,
      email: r.user.emails.at(-1)?.email ?? "",
    })),
  }

  return result
}
