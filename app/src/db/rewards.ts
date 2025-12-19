"use server"

import { Prisma, PrismaClient } from "@prisma/client"
import { cache } from "react"

import { isProjectBlacklisted } from "@/db/projects"
import { REWARD_CLAIM_STATUS } from "@/lib/constants"
import { SuperfluidVestingSchedule } from "@/lib/superfluid"
import { generateRewardStreamId } from "@/lib/utils/rewards"

import { prisma } from "./client"

async function getFundingRewardsByRoundIdsAndSearchFn(
  {
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
  },
  db: PrismaClient = prisma,
) {
  const skip = (page - 1) * pageSize
  const take = pageSize

  // Build the where clause - if roundIds is empty, don't filter by roundId (show all rounds)
  const whereClause: Prisma.FundingRewardWhereInput = {
    ...(roundIds.length > 0 && { roundId: { in: roundIds } }),
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
  }

  const [rewards, totalCount] = await db.$transaction([
    db.fundingReward.findMany({
      where: whereClause,
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
    db.fundingReward.count({
      where: whereClause,
    }),
  ])

  return { rewards, totalCount }
}

export const getFundingRewardsByRoundIdsAndSearch = cache(
  (params: {
    roundIds: string[]
    search: string
    sortBy: "asc" | "desc"
    page?: number
    pageSize?: number
  }) => getFundingRewardsByRoundIdsAndSearchFn(params, prisma),
)

export async function getFundingRewardsByRoundIdsAndSearchWithClient(
  params: {
    roundIds: string[]
    search: string
    sortBy: "asc" | "desc"
    page?: number
    pageSize?: number
  },
  db: PrismaClient = prisma,
) {
  return getFundingRewardsByRoundIdsAndSearchFn(params, db)
}

async function getRewardFn(
  { id }: { id: string },
  db: PrismaClient = prisma,
) {
  return db.fundingReward.findUnique({
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

export const getReward = cache((params: { id: string }) =>
  getRewardFn(params, prisma),
)

export async function getRewardWithClient(
  params: { id: string },
  db: PrismaClient = prisma,
) {
  return getRewardFn(params, db)
}

export async function insertRewards(
  rewards: {
    id: string
    projectId: string
    amount: number
  }[],
  db: PrismaClient = prisma,
) {
  // Filter out blacklisted projects
  const validRewards = await Promise.all(
    rewards.map(async (reward) => {
      const blacklisted = await isProjectBlacklisted(reward.projectId)

      if (blacklisted) {
        console.warn(
          `Skipping blacklisted project ${reward.projectId} for reward ${reward.id}`,
        )
        return null
      }

      return reward
    }),
  )

  const filteredRewards = validRewards.filter(Boolean) as typeof rewards

  return db.fundingReward.createMany({
    data: filteredRewards.map((reward) => ({
      roundId: "4",
      ...reward,
    })),
    skipDuplicates: true,
  })
}

async function canClaimToAddressFn(
  {
    address,
    rewardId,
  }: {
    address: string
    rewardId: string
  },
  db: PrismaClient = prisma,
) {
  const [reward, claim] = await Promise.all([
    db.fundingReward.findFirst({
      where: {
        id: rewardId,
      },
    }),
    db.rewardClaim.findMany({
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

export const canClaimToAddress = cache(
  (params: { address: string; rewardId: string }) =>
    canClaimToAddressFn(params, prisma),
)

export async function canClaimToAddressWithClient(
  params: { address: string; rewardId: string },
  db: PrismaClient = prisma,
) {
  return canClaimToAddressFn(params, db)
}

export async function startClaim(
  {
    rewardId,
    address,
    userId,
  }: {
    rewardId: string
    userId: string
    address: string
  },
  db: PrismaClient = prisma,
) {
  // Deletes any existing claim for the reward
  const deleteClaim = db.rewardClaim.deleteMany({
    where: {
      rewardId,
    },
  })

  const createClaim = db.rewardClaim.create({
    data: {
      rewardId,
      address: address.toLowerCase(),
      addressSetById: userId,
      addressSetAt: new Date(),
      status: "pending",
    },
  })

  const [, claim] = await Promise.all([deleteClaim, createClaim])

  return claim
}

export async function updateClaim(
  rewardId: string,
  data: Prisma.RewardClaimUpdateInput,
  db: PrismaClient = prisma,
) {
  return db.rewardClaim.update({
    where: {
      rewardId,
    },
    data,
  })
}

export async function ensureClaim(
  rewardId: string,
  db: PrismaClient = prisma,
) {
  return db.rewardClaim.upsert({
    where: {
      rewardId,
    },
    update: {},
    create: {
      rewardId,
      status: "pending",
    },
  })
}

async function getClaimByRewardIdFn(
  { rewardId }: { rewardId: string },
  db: PrismaClient = prisma,
) {
  return db.rewardClaim.findFirst({
    where: {
      rewardId,
    },
  })
}

export async function deleteClaim(
  rewardId: string,
  db: PrismaClient = prisma,
) {
  return db.rewardClaim.delete({
    where: {
      rewardId,
    },
  })
}

export const getClaimByRewardId = cache((params: { rewardId: string }) =>
  getClaimByRewardIdFn(params, prisma),
)

export async function getClaimByRewardIdWithClient(
  params: { rewardId: string },
  db: PrismaClient = prisma,
) {
  return getClaimByRewardIdFn(params, db)
}

export async function getKYCTeamsWithRewardsForRound(
  roundId: string,
  db: PrismaClient = prisma,
) {
  return db.kYCTeam.findMany({
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
      KYCLegalEntityTeams: {
        include: {
          legalEntity: true,
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

export async function getRewardStreamsWithRewardsForRound(
  roundId: string,
  db: PrismaClient = prisma,
) {
  // IMPORTANT: Must include soft deleted kyc teams and projects

  return db.rewardStream.findMany({
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
          KYCLegalEntityTeams: {
            include: {
              legalEntity: true,
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
  db: PrismaClient = prisma,
) {
  // Check if there's an existing stream with the same sender/receiver combination
  // This handles the case where a user might have multiple streams (e.g., one vested, one vesting)
  const existingStream = await db.superfluidStream.findFirst({
    where: {
      sender: stream.sender,
      receiver: stream.receiver.toLowerCase(),
    },
  })

  // Only delete the existing stream if:
  // 1. There is an existing stream with the same sender/receiver
  // 2. The new stream has a different ID (not just an update)
  // 3. The new stream has flowRate > 0 (active vesting)
  if (
    existingStream &&
    existingStream.id !== stream.id &&
    parseFloat(stream.flowRate) > 0
  ) {
    await db.superfluidStream.delete({
      where: {
        id: existingStream.id,
      },
    })
  }
  return db.superfluidStream.upsert({
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
  db: PrismaClient = prisma,
) {
  const kycTeam = await db.kYCTeam.findUnique({
    where: {
      walletAddress: stream.receiver.toLowerCase(),
    },
    include: {
      projects: {
        select: {
          id: true,
          blacklist: true,
        },
      },
    },
  })

  if (!kycTeam) {
    return undefined
  }

  // Filter out blacklisted projects
  const validProjects = kycTeam.projects.filter((project) => !project.blacklist)

  if (validProjects.length === 0) {
    return undefined
  }

  const rewardId = generateRewardStreamId(
    validProjects.map((project) => project.id),
    roundId,
  )

  // if KYCTeam is deleted, this means we don't need to link the reward stream to the KYCTeam
  if (kycTeam.deletedAt) {
    return rewardId
  }

  const rewardStream = await db.rewardStream.upsert({
    where: {
      id: rewardId,
    },
    update: {},
    create: {
      id: rewardId,
      projects: validProjects.map((project) => project.id),
      roundId,
      kycTeamId: kycTeam.id,
    },
  })

  return rewardStream.id
}

export async function getProjectRecurringRewards(
  projectId: string,
  db: PrismaClient = prisma,
) {
  return db.recurringReward.findMany({
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
              KYCLegalEntityTeams: {
                include: {
                  legalEntity: true,
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

export async function expireClaims(db: PrismaClient = prisma) {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  return db.rewardClaim.updateMany({
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
