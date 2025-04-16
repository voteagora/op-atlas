"use server"

import { revalidatePath } from "next/cache"
import { isAddress, keccak256, parseUnits, formatUnits } from "viem"

import { auth } from "@/auth"
import {
  canClaimToAddress,
  deleteClaim,
  getKYCTeamsWithRewardsForRound,
  getReward,
  startClaim,
  updateClaim,
} from "@/db/rewards"

import { getActiveStreams } from "../superfluid"
import { verifyAdminStatus } from "./utils"

// TODO: Can filter by sender once we have it
export const getActiveStream = async (address: string) => {
  if (!isAddress(address)) {
    return {
      error: "Invalid address",
    }
  }

  try {
    const streams = await getActiveStreams(address.toLowerCase())
    return {
      error: null,
      stream: streams[0] ?? null,
    }
  } catch (error: unknown) {
    return {
      error: (error as Error).message,
    }
  }
}

export const addAddressToRewardsClaim = async (
  rewardId: string,
  address: string,
) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const reward = await getReward({ id: rewardId })
  if (!reward) {
    return {
      error: "Reward not found",
    }
  }

  const isInvalid = await verifyAdminStatus(
    reward.project.id,
    session.user.farcasterId,
  )
  if (isInvalid?.error) {
    return isInvalid
  }

  if (!isAddress(address)) {
    return {
      error: "Invalid address",
    }
  }

  // Address can't be used by another claim
  const canClaim = await canClaimToAddress({ address, rewardId })
  if (!canClaim) {
    return {
      error: "Address already in use for this round",
    }
  }

  // Create the claim
  await startClaim({ rewardId, address, userId: session.user.id })

  const updated = await getReward({ id: rewardId })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
  revalidatePath("/rewards/[rewardId]/page", "page")

  return {
    error: null,
    reward: updated,
  }
}

export const completeRewardsClaim = async (rewardId: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const reward = await getReward({ id: rewardId })
  if (!reward) {
    return {
      error: "Reward not found",
    }
  }

  const isInvalid = await verifyAdminStatus(
    reward.project.id,
    session.user.farcasterId,
  )
  if (isInvalid?.error) {
    return isInvalid
  }

  const claim = await updateClaim(rewardId, { status: "claimed" })

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
  revalidatePath("/rewards/[rewardId]/page", "page")

  return {
    error: null,
    claim,
  }
}

export const resetRewardsClaim = async (rewardId: string) => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
    }
  }

  const reward = await getReward({ id: rewardId })
  if (!reward) {
    return {
      error: "Reward not found",
    }
  }

  const isInvalid = await verifyAdminStatus(
    reward.project.id,
    session.user.farcasterId,
  )
  if (isInvalid?.error) {
    return isInvalid
  }

  const claim = await deleteClaim(rewardId)

  revalidatePath("/dashboard")
  revalidatePath("/projects", "layout")
  revalidatePath("/rewards/[rewardId]", "page")

  return {
    error: null,
    claim,
  }
}

type RewardStream = {
  id: string
  projectIds: string[]
  projectNames: string[]
  wallets: string[]
  KYCStatusCompleted: boolean
  amounts: string[]
}

function sumBigNumbers(numbers: string[]): string {
  const total = numbers.reduce((acc, curr) => {
    const parsed = parseUnits(curr, 18)
    return acc + parsed
  }, BigInt(0))
  return formatUnits(total, 18)
}

export const getRewardStreamsForRound = async (
  roundId: string,
): Promise<RewardStream[]> => {
  const kycTeams = await getKYCTeamsWithRewardsForRound(roundId)

  const rewardStreams = kycTeams.map((kycTeam) => {
    const projectIds = kycTeam.projects.map((project) => project.id)
    return {
      id: keccak256(Buffer.from(projectIds.join(""))),
      projectIds,
      projectNames: kycTeam.projects.map((project) => project.name),
      wallets: [kycTeam.walletAddress],
      KYCStatusCompleted: kycTeam.team.every(
        (team) => team.users.status === "APPROVED",
      ),
      amounts: kycTeam.projects
        .map((project) =>
          project.recurringRewards
            .sort((a, b) => a.tranche - b.tranche) // Sort by tranche asc
            .map((reward) => reward.amount),
        )
        .reduce((acc, curr) => [...acc, sumBigNumbers(curr)], []),
    }
  })

  return rewardStreams
}
