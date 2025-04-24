"use server"

import { revalidatePath } from "next/cache"
import { isAddress } from "viem"

import { auth } from "@/auth"
import {
  canClaimToAddress,
  createOrUpdateSuperfluidStream,
  createRewardStream,
  deleteClaim,
  getKYCTeamsWithRewardsForRound,
  getReward,
  getRewardStreamsWithRewardsForRound,
  startClaim,
  updateClaim,
} from "@/db/rewards"

import { getActiveStreams, SuperfluidStream } from "../superfluid"
import { processStream } from "../utils/rewards"
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

export const getRewardStreamsForRound = async (
  roundId: string,
): Promise<RewardStream[]> => {
  const existingStreams = (async () => {
    const streams = await getRewardStreamsWithRewardsForRound(roundId)
    return streams.map((stream) => processStream(stream.teams, stream.id))
  })()

  const newStreams = (async () => {
    const kycTeams = await getKYCTeamsWithRewardsForRound(roundId)
    return kycTeams.map((kycTeam) => processStream([kycTeam]))
  })()

  return [...(await existingStreams), ...(await newStreams)]
}

export const processSuperfluidStream = async (
  stream: SuperfluidStream,
  roundId: string,
) => {
  // Create RewardStream
  const rewardStream = await createRewardStream(stream, roundId)
  // Create SuperfluidStream
  await createOrUpdateSuperfluidStream(stream, rewardStream?.id)
}
