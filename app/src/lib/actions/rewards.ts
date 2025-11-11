"use server"

import { revalidatePath } from "next/cache"
import { isAddress } from "viem"

import {
  canClaimToAddressWithClient,
  createOrUpdateSuperfluidStream,
  createRewardStream,
  deleteClaim,
  getKYCTeamsWithRewardsForRound,
  getRewardWithClient,
  getRewardStreamsWithRewardsForRound,
  startClaim,
  updateClaim,
} from "@/db/rewards"
import { withSessionDb, SessionDbContext } from "@/lib/db/sessionContext"

import { getActiveStreams, SuperfluidVestingSchedule } from "../superfluid"
import { processStream } from "../utils/rewards"
import { verifyAdminStatus } from "./utils"

type RewardMemberContext = SessionDbContext & {
  userId: string
  reward: NonNullable<Awaited<ReturnType<typeof getRewardWithClient>>>
}

async function withRewardMember<T>(
  rewardId: string,
  handler: (ctx: RewardMemberContext) => Promise<T>,
) {
  return withSessionDb(async (ctx) => {
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
  }, { requireUser: true })
}

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
  season: number,
): Promise<RewardStream[]> =>
  withSessionDb(async ({ db }) => {
    const existingStreams = await getRewardStreamsWithRewardsForRound(
      roundId,
      db,
    )
    const processedExistingStreams = await Promise.all(
      existingStreams.map((stream) =>
        processStream(stream.streams, stream.team, roundId, season, stream.id),
      ),
    )

    const kycTeams = await getKYCTeamsWithRewardsForRound(roundId, db)
    const newStreams = await Promise.all(
      kycTeams.map((kycTeam) => processStream([], kycTeam, roundId, season)),
    )

    const allStreams = [...processedExistingStreams, ...newStreams]
    return allStreams.filter((stream): stream is RewardStream => stream !== null)
  })

export const processSuperfluidStream = async (
  stream: SuperfluidVestingSchedule,
  roundId: string,
) =>
  withSessionDb(async ({ db }) => {
    const rewardStreamId = await createRewardStream(stream, roundId, db)
    await createOrUpdateSuperfluidStream(stream, rewardStreamId, db)
  })
