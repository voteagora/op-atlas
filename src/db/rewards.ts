"use server"

import { prisma } from "./client"

export async function getReward({ id }: { id: string }) {
  return prisma.fundingReward.findUnique({
    where: {
      id,
    },
    include: {
      claim: true,
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

export async function startClaim({
  rewardId,
  address,
  userId,
}: {
  rewardId: string
  userId: string
  address: string
}) {
  return prisma.rewardClaim.create({
    data: {
      rewardId,
      address,
      addressSetById: userId,
      addressSetAt: new Date(),
      status: "pending",
    },
  })
}

export async function updateClaim({
  rewardId,
  status,
}: {
  rewardId: string
  status: string
}) {
  return prisma.rewardClaim.update({
    where: {
      rewardId,
    },
    data: {
      status,
    },
  })
}
