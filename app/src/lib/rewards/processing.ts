import "server-only"

import {
  createOrUpdateSuperfluidStream,
  createRewardStream,
  getKYCTeamsWithRewardsForRound,
  getRewardStreamsWithRewardsForRound,
} from "@/db/rewards"
import { prisma } from "@/db/client"
import { processStream } from "@/lib/utils/rewards"
import { SuperfluidVestingSchedule } from "@/lib/superfluid"

export type RewardStream = {
  id: string
  projectIds: string[]
  projectNames: string[]
  wallets: string[]
  KYCStatusCompleted: boolean
  amounts: string[]
}

export async function getRewardStreamsForRound(
  roundId: string,
  season: number,
) {
  const existingStreams = await getRewardStreamsWithRewardsForRound(
    roundId,
    prisma,
  )
  const processedExistingStreams = await Promise.all(
    existingStreams.map((stream) =>
      processStream(stream.streams, stream.team, roundId, season, stream.id),
    ),
  )

  const kycTeams = await getKYCTeamsWithRewardsForRound(roundId, prisma)
  const newStreams = await Promise.all(
    kycTeams.map((kycTeam) => processStream([], kycTeam, roundId, season)),
  )

  const allStreams = [...processedExistingStreams, ...newStreams]
  return allStreams.filter((stream): stream is RewardStream => stream !== null)
}

export async function processSuperfluidStream(
  stream: SuperfluidVestingSchedule,
  roundId: string,
) {
  const rewardStreamId = await createRewardStream(stream, roundId, prisma)
  await createOrUpdateSuperfluidStream(stream, rewardStreamId, prisma)
}
