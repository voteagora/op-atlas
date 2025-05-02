import { SuperfluidStream } from "@prisma/client"
import { formatUnits, keccak256, parseUnits } from "viem"

import {
  KYCStreamTeam,
  KYCTeamWithTeam,
  RecurringRewardWithProject,
} from "../types"
import { isKycTeamVerified } from "./kyc"

export function generateRewardStreamId(projectIds: string[]) {
  return keccak256(Buffer.from(projectIds.sort().join("")))
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

export function processStream(teams: KYCStreamTeam[], streamId?: string) {
  // Order teams by deletedAt: deletedAt is null for the current team -- current team comes last
  const orderedTeams = teams.sort((a, b) => {
    if (!a.deletedAt && !b.deletedAt)
      throw new Error("Multiple active addresses detected")
    if (!a.deletedAt) return 1
    if (!b.deletedAt) return -1
    return a.deletedAt.getTime() - b.deletedAt.getTime()
  })

  const currentTeam = orderedTeams[0]

  if (!currentTeam) {
    throw new Error("No team found for stream")
  }

  const projectsWithRewards = currentTeam.projects.filter(
    (project) => project.recurringRewards.length > 0,
  )

  return {
    id:
      streamId ?? generateRewardStreamId(projectsWithRewards.map((p) => p.id)),
    projectIds: projectsWithRewards.map((project) => project.id),
    projectNames: projectsWithRewards.map((project) => project.name),
    wallets: orderedTeams.map((team) => team.walletAddress),
    KYCStatusCompleted: isKycTeamVerified(currentTeam),
    amounts: calculateRewardAmounts(projectsWithRewards),
  }
}

export type RecurringRewardsByRound = {
  roundId: string
  rewards: RecurringRewardWithProject[]
  kycTeam?: KYCTeamWithTeam
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
      streams: kycTeam?.rewardStream?.streams ?? [],
    }
  })
}
