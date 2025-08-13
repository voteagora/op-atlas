import { Prisma, SuperfluidStream } from "@prisma/client"
import { formatUnits, keccak256, parseUnits } from "viem"

import { isKycStreamTeamVerified } from "@/lib/utils/kyc"

import {
  KYCStreamTeam,
  KYCTeamWithTeam,
  RecurringRewardWithProject,
  StreamWithKYCTeam,
} from "../types"

export function generateRewardStreamId(projectIds: string[], roundId: string) {
  return keccak256(Buffer.from([...projectIds.sort(), roundId].join("")))
}

type ProjectWithRewards = {
  recurringRewards: Array<{
    tranche: number
    amount: string
  }>
}

function sumBigNumbers(numbers: string[]): string {
  const total = numbers.reduce((acc, curr) => {
    const parsed = parseUnits(curr, 18)
    return acc + parsed
  }, BigInt(0))
  return formatUnits(total, 18)
}

function calculateRewardAmounts(projectsWithRewards: ProjectWithRewards[]) {
  // Group rewards by tranche
  const rewardsByTranche = new Map<number, string[]>()

  // Find the maximum tranche number
  const maxTranche = Math.max(
    ...projectsWithRewards.flatMap((project) =>
      project.recurringRewards.map((reward) => reward.tranche),
    ),
  )

  // Initialize all tranches up to maxTranche
  for (let i = 1; i <= maxTranche; i++) {
    rewardsByTranche.set(i, [])
  }

  // Add actual rewards
  projectsWithRewards.forEach((project) => {
    project.recurringRewards.forEach((reward) => {
      rewardsByTranche.get(reward.tranche)?.push(reward.amount)
    })
  })

  // Sum amounts for each tranche, using null for empty tranches
  return Array.from(rewardsByTranche.entries())
    .sort(([trancheA], [trancheB]) => trancheA - trancheB) // Sort by tranche ascending
    .map(([_, amounts]) => (amounts.length > 0 ? sumBigNumbers(amounts) : "0"))
}

export async function processStream(
  streams: StreamWithKYCTeam[],
  currentTeam: KYCStreamTeam,
  roundId: string,
  streamId?: string,
) {
  const orderedStreams = streams.sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(), // Sort by createdAt ascending
  )

  const wallets = orderedStreams
    .map((stream) => stream.kycTeam?.walletAddress)
    .filter((wallet) => wallet !== undefined)

  // append current team's wallet address
  if (!wallets.includes(currentTeam.walletAddress)) {
    wallets.push(currentTeam.walletAddress)
  }

  const projectsWithRewards = currentTeam.projects.filter(
    (project) => project.recurringRewards.length > 0,
  )

  return {
    id:
      streamId ??
      generateRewardStreamId(
        projectsWithRewards.map((p) => p.id),
        roundId,
      ),
    projectIds: projectsWithRewards.map((project) => project.id),
    projectNames: projectsWithRewards.map((project) => project.name),
    wallets,
    KYCStatusCompleted: isKycStreamTeamVerified(currentTeam),
    amounts: [
      calculateRewardAmounts(projectsWithRewards)[0],
      calculateRewardAmounts(projectsWithRewards)[1],
      calculateRewardAmounts(projectsWithRewards)[2],
      calculateRewardAmounts(projectsWithRewards)[3],
      calculateRewardAmounts(projectsWithRewards)[4],
    ],
  }
}

export type RecurringRewardKycTeam = Prisma.KYCTeamGetPayload<{
  include: {
    superfludStream: true
    team: {
      select: {
        users: true
      }
    }
    rewardStreams: {
      include: {
        streams: true
      }
    }
  }
}>

export type RecurringRewardsByRound = {
  roundId: string
  rewards: RecurringRewardWithProject[]
  kycTeam?: RecurringRewardKycTeam
  streams: SuperfluidStream[]
}

export function formatRecurringRewards(
  recurringRewards?: RecurringRewardWithProject[],
): RecurringRewardsByRound[] {
  if (!recurringRewards) return []

  // Group by round
  const recurringRewardsByRound = recurringRewards.reduce((acc, reward) => {
    if (!acc[reward.roundId]) {
      acc[reward.roundId] = []
    }
    acc[reward.roundId].push(reward)
    return acc
  }, {} as Record<string, RecurringRewardWithProject[]>)

  return Object.entries(recurringRewardsByRound).map(([round, rewards]) => {
    const project = rewards[0].project
    const kycTeam = project.kycTeam

    return {
      roundId: round,
      rewards: rewards.map((reward) => {
        return {
          ...reward,
        }
      }),
      kycTeam: kycTeam ?? undefined,
      streams:
        kycTeam?.rewardStreams
          .filter((stream) => stream.roundId === round)
          .flatMap((stream) => stream.streams) ?? [],
    }
  })
}
