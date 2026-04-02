"use server"

import { revalidatePath } from "next/cache"
import { isAddress } from "viem"

import {
  canClaimToAddressWithClient,
  deleteClaim,
  getRewardWithClient,
  startClaim,
  updateClaim,
} from "@/db/rewards"
import { withImpersonation, SessionContext } from "@/lib/db/sessionContext"

import { getActiveStreams } from "../superfluid"
import { userOwnsAddress, verifyAdminStatus } from "./utils"

type RewardMemberContext = SessionContext & {
  userId: string
  reward: NonNullable<Awaited<ReturnType<typeof getRewardWithClient>>>
}

async function withRewardMember<T>(
  rewardId: string,
  handler: (ctx: RewardMemberContext) => Promise<T>,
) {
  return withImpersonation(
    async (ctx) => {
      if (!ctx.userId) {
        return {
          error: "Unauthorized",
        } as T
      }

      const reward = await getRewardWithClient({ id: rewardId }, ctx.db)
      if (!reward) {
        return {
          error: "Reward not found",
        } as T
      }

      const membership = await verifyAdminStatus(
        reward.project.id,
        ctx.userId,
        ctx.db,
      )
      if (membership?.error) {
        return membership as T
      }

      return handler({ ...ctx, userId: ctx.userId, reward })
    },
    { requireUser: true },
  )
}

// TODO: Can filter by sender once we have it
export const getActiveStream = async (address: string) => {
  if (!isAddress(address)) {
    return {
      error: "Invalid address",
    }
  }

  return withImpersonation(
    async ({ db, userId }) => {
      if (!userId) {
        return {
          error: "Unauthorized",
        }
      }

      const ownsAddress = await userOwnsAddress(userId, address, db)
      if (!ownsAddress) {
        return {
          error: "Unauthorized",
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
    },
    { requireUser: true },
  )
}

export const addAddressToRewardsClaim = async (
  rewardId: string,
  address: string,
) =>
  withRewardMember(rewardId, async ({ db, userId }) => {
    if (!isAddress(address)) {
      return {
        error: "Invalid address",
      }
    }

    const canClaim = await canClaimToAddressWithClient(
      { address, rewardId },
      db,
    )
    if (!canClaim) {
      return {
        error: "Address already in use for this round",
      }
    }

    await startClaim({ rewardId, address, userId }, db)

    const updated = await getRewardWithClient({ id: rewardId }, db)

    revalidatePath("/dashboard")
    revalidatePath("/projects", "layout")
    revalidatePath("/rewards/[rewardId]/page", "page")

    return {
      error: null,
      reward: updated,
    }
  })

export const completeRewardsClaim = async (rewardId: string) => {
  return withRewardMember(rewardId, async ({ db }) => {
    const claim = await updateClaim(rewardId, { status: "claimed" }, db)

    revalidatePath("/dashboard")
    revalidatePath("/projects", "layout")
    revalidatePath("/rewards/[rewardId]/page", "page")

    return {
      error: null,
      claim,
    }
  })
}

export const resetRewardsClaim = async (rewardId: string) => {
  return withRewardMember(rewardId, async ({ db }) => {
    const claim = await deleteClaim(rewardId, db)

    revalidatePath("/dashboard")
    revalidatePath("/projects", "layout")
    revalidatePath("/rewards/[rewardId]", "page")

    return {
      error: null,
      claim,
    }
  })
}
