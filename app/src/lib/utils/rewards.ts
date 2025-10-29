import { Prisma, SuperfluidStream } from "@prisma/client"
import { formatUnits, keccak256, parseUnits } from "viem"

import { SEASON_TRANCHES } from "@/lib/constants/rewards"
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
  season: number,
  streamId?: string,
): Promise<{
  id: string
  projectIds: string[]
  projectNames: string[]
  wallets: string[]
  KYCStatusCompleted: boolean
  amounts: string[]
} | null> {
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

  const calculatedAmounts = calculateRewardAmounts(projectsWithRewards)
  
  // Get active tranches for this season/round combination
  const seasonKey = `${season}-${roundId}` as keyof typeof SEASON_TRANCHES
  const activeTranches = SEASON_TRANCHES[seasonKey] || []
  
  // Map only the active tranches
  const amounts = activeTranches.map(trancheNum =>
    calculatedAmounts[trancheNum - 1] ?? "0"
  )

  // Filter out streams where all amounts are zero/null
  const hasNonZeroAmounts = amounts.some(amount =>
    amount && amount !== "0" && amount !== "0.0"
  )

  if (!hasNonZeroAmounts) {
    return null
  }

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
    amounts,
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
    KYCLegalEntityTeams: {
      include: {
        legalEntity: true
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
  season: number // 7 for S7 (tranches 1-6), 8 for S8 (tranches 7+)
  rewards: RecurringRewardWithProject[]
  kycTeam?: RecurringRewardKycTeam
  streams: SuperfluidStream[]
}

export function formatRecurringRewards(
  recurringRewards?: RecurringRewardWithProject[],
): RecurringRewardsByRound[] {
  if (!recurringRewards) return []

  // Group by round AND season (tranches 1-6 = S7, tranches 7+ = S8)
  const grouped = recurringRewards.reduce((acc, reward) => {
    const season = reward.tranche <= 6 ? 7 : 8
    const key = `${reward.roundId}-${season}`

    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(reward)
    return acc
  }, {} as Record<string, RecurringRewardWithProject[]>)

  return Object.entries(grouped).map(([key, rewards]) => {
    const [roundId, seasonStr] = key.split('-')
    const season = parseInt(seasonStr, 10)
    const project = rewards[0].project
    const kycTeam = project.kycTeam

    return {
      roundId,
      season,
      rewards: rewards.map((reward) => {
        return {
          ...reward,
        }
      }),
      kycTeam: kycTeam ?? undefined,
      streams:
        kycTeam?.rewardStreams
          .filter((stream) => stream.roundId === roundId)
          .flatMap((stream) => stream.streams) ?? [],
    }
  })
}

/**
 * Calculate the expiry date for a reward claim based on tranche
 * Tranche 1 = Feb 2025, expires Feb 28, 2026
 * Tranche 2 = Mar 2025, expires Mar 31, 2026
 * etc.
 */
export function calculateTrancheExpiryDate(tranche: number): Date {
  // Start from Feb 1, 2025
  const baseDate = new Date(2025, 1, 1) // Month is 0-indexed, so 1 = February

  // Add tranche months
  const trancheEndDate = new Date(baseDate)
  trancheEndDate.setMonth(baseDate.getMonth() + tranche)

  // Go to the last day of that month (set day to 0 of next month)
  trancheEndDate.setDate(0)

  // Add 1 year
  const expiryDate = new Date(trancheEndDate)
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)

  return expiryDate
}

/**
 * Format the expiry date as a string for display
 * e.g., "Feb 28, 2026"
 */
export function formatExpiryDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
