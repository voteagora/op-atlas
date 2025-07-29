"use server"

import { Prisma } from "@prisma/client"
import { cache } from "react"

import { REWARD_CLAIM_STATUS } from "@/lib/constants"
import { SuperfluidVestingSchedule } from "@/lib/superfluid"
import { generateRewardStreamId } from "@/lib/utils/rewards"

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
    prisma.rewardClaim.findMany({
      where: {
        address: address.toLowerCase(),
      },
      include: {
        reward: true,
      },
    }),
  ])

  // Can only claim to the same address in different rounds
  return (
    claim.length === 0 ||
    claim.every((c) => c.reward.roundId !== reward?.roundId)
  )
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

export async function getKYCTeamsWithRewardsForRound(roundId: string) {
  return prisma.kYCTeam.findMany({
    where: {
      deletedAt: null,
      projects: {
        some: {
          recurringRewards: {
            some: {
              roundId,
            },
          },
        },
      },
      rewardStreams: {
        none: {
          roundId,
        },
      },
    },
    include: {
      team: {
        include: {
          users: true,
        },
      },
      rewardStreams: true,
      projects: {
        select: {
          id: true,
          name: true,
          recurringRewards: {
            where: {
              roundId,
            },
          },
          kycTeam: true,
        },
      },
    },
  })
}

export async function getRewardStreamsWithRewardsForRound(roundId: string) {
  // IMPORTANT: Must include soft deleted kyc teams and projects

  return prisma.rewardStream.findMany({
    where: {
      roundId,
    },
    include: {
      team: {
        include: {
          team: {
            include: {
              users: true,
            },
          },
          rewardStreams: {
            where: {
              roundId,
            },
          },
          projects: {
            include: {
              recurringRewards: {
                where: {
                  roundId,
                },
              },
            },
          },
        },
      },
      streams: {
        include: {
          kycTeam: true,
        },
      },
    },
  })
}

export async function createOrUpdateSuperfluidStream(
  stream: SuperfluidVestingSchedule,
  rewardStreamId?: string,
) {
  return prisma.superfluidStream.upsert({
    where: {
      id: stream.id,
    },
    update: {
      flowRate: stream.flowRate,
      deposit: stream.totalAmount,
      internalStreamId: rewardStreamId,
      updatedAt: new Date(),
    },
    create: {
      id: stream.id,
      flowRate: stream.flowRate,
      sender: stream.sender,
      receiver: stream.receiver.toLowerCase(),
      deposit: stream.totalAmount,
      internalStreamId: rewardStreamId,
    },
  })
}

export async function createRewardStream(
  stream: SuperfluidVestingSchedule,
  roundId: string,
) {
  const kycTeam = await prisma.kYCTeam.findUnique({
    where: {
      walletAddress: stream.receiver.toLowerCase(),
    },
    include: {
      projects: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!kycTeam || kycTeam.projects.length === 0) {
    return undefined
  }

  const rewardId = generateRewardStreamId(
    kycTeam.projects.map((project) => project.id),
    roundId,
  )

  // if KYCTeam is deleted, this means we don't need to link the reward stream to the KYCTeam
  if (kycTeam.deletedAt) {
    return rewardId
  }

  const rewardStream = await prisma.rewardStream.upsert({
    where: {
      id: rewardId,
    },
    update: {},
    create: {
      id: rewardId,
      projects: kycTeam.projects.map((project) => project.id),
      roundId,
      kycTeamId: kycTeam.id,
    },
  })

  return rewardStream.id
}

export async function getProjectRecurringRewards(projectId: string) {
  return prisma.recurringReward.findMany({
    where: {
      projectId,
    },
    include: {
      project: {
        include: {
          kycTeam: {
            include: {
              superfludStream: true,
              team: {
                select: {
                  users: true,
                },
              },
              rewardStreams: {
                include: {
                  streams: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function expireClaims() {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  return prisma.rewardClaim.updateMany({
    where: {
      status: REWARD_CLAIM_STATUS.PENDING,
      reward: {
        round: {
          endDate: {
            lt: oneYearAgo,
          },
        },
      },
    },
    data: {
      status: REWARD_CLAIM_STATUS.EXPIRED,
    },
  })
}
