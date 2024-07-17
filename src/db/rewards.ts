"use server"

import { Prisma } from "@prisma/client"

import { prisma } from "./client"

export async function getFundingRewardsByRoundIdAndSearch({
  roundId,
  search,
  sortBy,
  page = 1,
  pageSize = 10,
}: {
  roundId: string
  search: string
  sortBy: "asc" | "desc"
  page?: number
  pageSize?: number
}) {
  const skip = (page - 1) * pageSize
  const take = pageSize

  const [rewards, totalCount] = await prisma.$transaction([
    prisma.fundingReward.findMany({
      where: {
        roundId: roundId,
        project: {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
      },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            thumbnailUrl: true,
            website: true,
          },
        },

        claim: {
          select: {
            status: true,
            address: true,
          },
        },
      },
      orderBy: {
        amount: sortBy,
      },
      skip,
      take,
    }),
    prisma.fundingReward.count({
      where: {
        roundId: roundId,
        project: {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
      },
    }),
  ])

  return { rewards, totalCount }
}

export async function getReward({ id }: { id: string }) {
  return prisma.fundingReward.findUnique({
    where: {
      id,
    },
    include: {
      claim: {
        include: {
          addressSetBy: true,
        },
      },
      project: {
        include: {
          team: {
            where: {
              deletedAt: null,
            },
            include: {
              user: true,
            },
          },
        },
      },
    },
  })
}

export async function insertRewards(
  rewards: {
    id: string
    projectId: string
    amount: number
  }[],
) {
  return prisma.fundingReward.createMany({
    data: rewards.map((reward) => ({
      roundId: "4",
      ...reward,
    })),
    skipDuplicates: true,
  })
}

export async function getClaimByAddress({ address }: { address: string }) {
  return prisma.rewardClaim.findFirst({
    where: {
      address: address.toLowerCase(),
    },
  })
}

export async function startClaim({
  rewardId,
  address,
  userId,
}: {
  rewardId: string
  userId: string
  address: string
}) {
  // Deletes any existing claim for the reward
  const deleteClaim = prisma.rewardClaim.deleteMany({
    where: {
      rewardId,
    },
  })

  const createClaim = prisma.rewardClaim.create({
    data: {
      rewardId,
      address: address.toLowerCase(),
      addressSetById: userId,
      addressSetAt: new Date(),
      status: "pending",
    },
  })

  return prisma.$transaction([deleteClaim, createClaim])
}

export async function updateClaim(
  rewardId: string,
  data: Prisma.RewardClaimUpdateInput,
) {
  return prisma.rewardClaim.update({
    where: {
      rewardId,
    },
    data,
  })
}
