import "server-only"

import { OpenRankSnapshot, SocialTrustPlatform } from "@prisma/client"

import { prisma } from "@/db/client"

export type OpenRankPlatform = `${SocialTrustPlatform}`

export interface OpenRankScore {
  identifier: string
  platform: OpenRankPlatform
  /** Normalized 0-1 score */
  score: number | null
  source: "snapshot" | "missing"
  loadedAt: Date | null
  snapshot?: OpenRankSnapshot
}

type LookupArgs = {
  seasonId: string
  platform: OpenRankPlatform
  identifier: string
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
