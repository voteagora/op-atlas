import "server-only"

import { OpenRankSnapshot, SocialTrustPlatform } from "@prisma/client"

import { prisma } from "@/db/client"

export type OpenRankPlatform = `${SocialTrustPlatform}`

export interface OpenRankScore {
  identifier: string
  platform: OpenRankPlatform
  /** Normalized 0-1 score */
  score: number | null
  source: "snapshot" | "mock" | "missing"
  loadedAt: Date | null
  snapshot?: OpenRankSnapshot
}

type LookupArgs = {
  seasonId: string
  platform: OpenRankPlatform
  identifier: string
}

const MOCK_OPEN_RANK_SCORES: Record<
  string,
  Array<{ platform: OpenRankPlatform; identifier: string; score: number }>
> = {
  "9": [
    { platform: "FARCASTER", identifier: "shaun", score: 0.82 },
    { platform: "GITHUB", identifier: "optimism", score: 0.76 },
    { platform: "X", identifier: "optimism", score: 0.7 },
    { platform: "FARCASTER", identifier: "emily", score: 0.88 },
  ],
}

export async function lookupOpenRankScore({
  seasonId,
  platform,
  identifier,
}: LookupArgs): Promise<OpenRankScore> {
  const normalizedIdentifier = normalizeIdentifier(identifier)
  const snapshot = await prisma.openRankSnapshot.findFirst({
    where: {
      seasonId,
      platform,
      identifier: normalizedIdentifier,
    },
    orderBy: { loadedAt: "desc" },
  })

  if (snapshot) {
    return {
      identifier,
      platform,
      score: snapshot.score ?? null,
      source: "snapshot",
      loadedAt: snapshot.loadedAt,
      snapshot,
    }
  }

  const mockScore = findMockScore(seasonId, platform, normalizedIdentifier)
  if (mockScore) {
    return {
      identifier,
      platform,
      score: mockScore.score,
      source: "mock",
      loadedAt: new Date(),
    }
  }

  return {
    identifier,
    platform,
    score: null,
    source: "missing",
    loadedAt: null,
  }
}

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase()
}

function findMockScore(
  seasonId: string,
  platform: OpenRankPlatform,
  identifier: string,
) {
  const seasonMocks = MOCK_OPEN_RANK_SCORES[seasonId]
  if (!seasonMocks) return null

  return seasonMocks.find(
    (entry) =>
      entry.platform === platform &&
      normalizeIdentifier(entry.identifier) === identifier,
  )
}
