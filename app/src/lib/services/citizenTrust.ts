import "server-only"

import {
  CitizenRegistrationStatus,
  citizenCategory,
  SocialTrustPlatform,
  Prisma,
} from "@prisma/client"

import {
  lookupOpenRankScore,
  OpenRankPlatform,
} from "@/lib/integrations/openrank"
import {
  fetchPassportScore,
  PassportScoreResult,
} from "@/lib/integrations/humanPassport"
import { prisma } from "@/db/client"

export type TrustBand = "NONE" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"

export interface WalletTrustScore {
  address: string
  score: number | null
  band: TrustBand
  source: PassportScoreResult
}

export interface SocialTrustScore {
  platform: SocialTrustPlatform
  identifier: string
  score: number | null
  band: TrustBand
  source:
    | OpenRankLookupResult
    | MissingOpenRankScore
}

type OpenRankLookupResult = Awaited<ReturnType<typeof lookupOpenRankScore>>
type MissingOpenRankScore = {
  score: null
  source: "missing"
  identifier: string
  platform: OpenRankPlatform
}

export interface TrustEvaluationResult {
  seasonId: string
  userId: string
  citizenType: citizenCategory
  walletScores: WalletTrustScore[]
  socialScores: SocialTrustScore[]
  hasPlatinum: boolean
  hasGold: boolean
  decision: "ALLOW" | "NEEDS_VERIFICATION" | "BLOCKED"
}

export interface EvaluateTrustArgs {
  seasonId: string
  userId: string
  citizenType: citizenCategory
  wallets: string[]
  socials: Array<{ platform: SocialTrustPlatform; identifier: string }>
  citizenSeasonId?: string | null
}

const WALLET_THRESHOLDS = {
  BRONZE: 15,
  SILVER: 25,
  GOLD: 50,
  PLATINUM: 75,
} as const

// OpenRank uses percentile-based tiers calculated from the score distribution
// < 50%: Bronze, 50-70%: Silver, 70-90%: Gold, 90%+: Platinum
const OPENRANK_PERCENTILE_THRESHOLDS = {
  BRONZE: 0, // >= 0% (any score)
  SILVER: 50, // >= 50th percentile
  GOLD: 70, // >= 70th percentile
  PLATINUM: 90, // >= 90th percentile
} as const

const WALLET_BATCH_SIZE = 5
const SOCIAL_BATCH_SIZE = 5

export async function evaluateTrustScores({
  seasonId,
  userId,
  citizenType,
  wallets,
  socials,
}: EvaluateTrustArgs): Promise<TrustEvaluationResult> {
  const walletScores = await evaluateWalletScores(wallets)
  const socialScores = await evaluateSocialScores({ seasonId, socials })

  const isBlocked = walletScores.some((wallet) => wallet.source.status === "blocked")

  if (isBlocked) {
    return {
      seasonId,
      userId,
      citizenType,
      walletScores,
      socialScores,
      hasPlatinum: false,
      hasGold: false,
      decision: "BLOCKED",
    }
  }

  const bands = [...walletScores, ...socialScores].map((score) => score.band)

  const platinumCount = bands.filter((band) => band === "PLATINUM").length
  const goldOrHigherCount = bands.filter((band) => band === "PLATINUM" || band === "GOLD").length

  const hasPlatinum = platinumCount > 0
  const hasGold = goldOrHigherCount > 0

  const meetsAutoPass = hasPlatinum && goldOrHigherCount >= 2

  return {
    seasonId,
    userId,
    citizenType,
    walletScores,
    socialScores,
    hasPlatinum,
    hasGold,
    decision: meetsAutoPass ? "ALLOW" : "NEEDS_VERIFICATION",
  }
}

export function serializeTrustScores(result: TrustEvaluationResult) {
  const socialRaw = result.socialScores.map((social) => ({
    platform: social.platform,
    identifier: social.identifier,
    score: social.score,
    band: social.band,
    source: social.source?.source ?? "missing",
    loadedAt: extractLoadedAt(social.source),
  }))

  const passportRaw = result.walletScores.map((wallet) => ({
    address: wallet.address,
    score: wallet.score,
    band: wallet.band,
    status: wallet.source.status,
    error: wallet.source.error ?? null,
  }))

  return {
    socialRaw,
    passportRaw,
  }
}

async function evaluateWalletScores(wallets: string[]): Promise<WalletTrustScore[]> {
  if (wallets.length === 0) {
    return []
  }

  const normalizedWallets = wallets.map((address) => address.toLowerCase())
  const uniqueWallets = Array.from(new Set(normalizedWallets))

  const uniqueResults = await mapInBatches(
    uniqueWallets,
    WALLET_BATCH_SIZE,
    async (address) => {
      const passportScore = await fetchPassportScore({ address })
      const band = mapWalletBand(passportScore)
      return {
        address,
        score: passportScore.score,
        band,
        source: passportScore,
      }
    },
  )

  const walletMap = new Map(uniqueWallets.map((address, index) => [address, uniqueResults[index]]))

  return normalizedWallets.map((address) => {
    const score = walletMap.get(address)
    if (!score) {
      throw new Error(`Missing passport score for wallet ${address}`)
    }
    return score
  })
}

async function evaluateSocialScores({
  seasonId,
  socials,
}: {
  seasonId: string
  socials: EvaluateTrustArgs["socials"]
}): Promise<SocialTrustScore[]> {
  if (socials.length === 0) {
    return []
  }

  const results = await mapInBatches(
    socials,
    SOCIAL_BATCH_SIZE,
    async ({ platform, identifier }) => {
      const lookup = await lookupOpenRankScore({
        seasonId,
        platform: platform as OpenRankPlatform,
        identifier,
      })

      // Calculate percentile-based band for OpenRank scores
      let band: TrustBand = "NONE"
      if (lookup.score !== null) {
        const percentile = await calculateOpenRankPercentile({
          seasonId,
          score: lookup.score,
        })
        band = mapPercentileToBand(percentile)
      }

      return {
        platform,
        identifier,
        score: lookup.score,
        band,
        source: lookup,
      }
    },
  )

  return results
}

function mapWalletBand(result: PassportScoreResult): TrustBand {
  switch (result.status) {
    case "blocked":
      return "NONE"
    case "insufficient":
      return "NONE"
    case "error":
      return "NONE"
    case "ok":
    default:
      break
  }

  if (result.score === null) {
    return "NONE"
  }

  if (result.score >= WALLET_THRESHOLDS.PLATINUM) return "PLATINUM"
  if (result.score >= WALLET_THRESHOLDS.GOLD) return "GOLD"
  if (result.score >= WALLET_THRESHOLDS.SILVER) return "SILVER"
  if (result.score >= WALLET_THRESHOLDS.BRONZE) return "BRONZE"
  return "NONE"
}


function mapDecisionToOutcome(
  decision: TrustEvaluationResult["decision"],
): CitizenRegistrationStatus {
  switch (decision) {
    case "BLOCKED":
      return CitizenRegistrationStatus.BLOCKED
    case "NEEDS_VERIFICATION":
      return CitizenRegistrationStatus.VERIFICATION_REQUIRED
    case "ALLOW":
    default:
      return CitizenRegistrationStatus.READY
  }
}

function extractLoadedAt(
  source: OpenRankLookupResult | MissingOpenRankScore | undefined,
) {
  if (!source) {
    return null
  }

  if ("loadedAt" in source) {
    return source.loadedAt ?? null
  }

  return null
}

async function mapInBatches<T, R>(
  items: readonly T[],
  batchSize: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return []
  }

  const size = Math.max(1, batchSize)
  const results: R[] = []

  for (let start = 0; start < items.length; start += size) {
    const batch = items.slice(start, start + size)
    const mapped = await Promise.all(
      batch.map((item, index) => mapper(item, start + index)),
    )
    results.push(...mapped)
  }

  return results
}

/**
 * Calculates the percentile rank of a score within the OpenRank distribution for a season.
 * Returns a value from 0-100 representing what percentage of scores are below the given score.
 */
async function calculateOpenRankPercentile({
  seasonId,
  score,
}: {
  seasonId: string
  score: number
}): Promise<number> {
  const [totalCount, belowCount] = await Promise.all([
    prisma.openRankSnapshot.count({
      where: {
        seasonId,
        score: { not: null },
      },
    }),
    prisma.openRankSnapshot.count({
      where: {
        seasonId,
        score: { lt: score },
      },
    }),
  ])

  if (totalCount === 0) {
    return 0
  }

  return (belowCount / totalCount) * 100
}

function mapPercentileToBand(percentile: number): TrustBand {
  if (percentile >= OPENRANK_PERCENTILE_THRESHOLDS.PLATINUM) return "PLATINUM"
  if (percentile >= OPENRANK_PERCENTILE_THRESHOLDS.GOLD) return "GOLD"
  if (percentile >= OPENRANK_PERCENTILE_THRESHOLDS.SILVER) return "SILVER"
  if (percentile >= OPENRANK_PERCENTILE_THRESHOLDS.BRONZE) return "BRONZE"
  return "NONE"
}
