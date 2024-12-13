"use server"

import { Prisma } from "@prisma/client"
import { cache } from "react"

import { prisma } from "./client"

async function getFundingRewardsByRoundIdsAndSearchFn({
  roundIds,
  search,
  sortBy,
  page = 1,
  pageSize = 10,
}: {
  roundIds: string[]
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
        roundId: { in: roundIds },
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
        roundId: true,
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
        roundId: { in: roundIds },
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

export const getFundingRewardsByRoundIdsAndSearch = cache(
  getFundingRewardsByRoundIdsAndSearchFn,
)

async function getRewardFn({ id }: { id: string }) {
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

export const getReward = cache(getRewardFn)

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

async function canClaimToAddressFn({
  address,
  rewardId,
}: {
  address: string
  rewardId: string
}) {
  const [reward, claim] = await Promise.all([
    prisma.fundingReward.findFirst({
      where: {
        id: rewardId,
      },
    }),
    prisma.rewardClaim.findFirst({
      where: {
        address: address.toLowerCase(),
      },
      include: {
        reward: true,
      },
    }),
  ])

  return !claim || reward?.projectId === claim.reward.projectId // can only claim to the same project
}

export const canClaimToAddress = cache(canClaimToAddressFn)

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

async function getClaimByRewardIdFn({ rewardId }: { rewardId: string }) {
  return prisma.rewardClaim.findFirst({
    where: {
      rewardId,
    },
  })
}

export async function deleteClaim(rewardId: string) {
  return prisma.rewardClaim.delete({
    where: {
      rewardId,
    },
  })
}

export const getClaimByRewardId = cache(getClaimByRewardIdFn)
