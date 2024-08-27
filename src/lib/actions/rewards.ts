"use server"

import { revalidatePath } from "next/cache"
import { isAddress } from "viem"

import { auth } from "@/auth"
import {
  getClaimByAddress,
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

  // Address can't already have an active superfluid stream
  const streams = await getActiveStreams(address.toLowerCase())
  if (streams.length > 0) {
    return {
      error: "Address already has a stream",
    }
  }

  // Address can't be used by another claim
  const claim = await getClaimByAddress({ address })
  if (claim) {
    return {
      error: "Address already in use by another project",
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
