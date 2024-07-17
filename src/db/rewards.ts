"use server"

import { Prisma } from "@prisma/client"

import { prisma } from "./client"

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
