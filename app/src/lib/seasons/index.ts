import "server-only"

import { cache } from "react"
import { Prisma, Season } from "@prisma/client"

import { prisma } from "@/db/client"

export const DEFAULT_SEASON_CONFIG = {
  trustScoring: {
    passThreshold: 50,
    blockThreshold: 0,
    socialWeight: 0.5,
    walletWeight: 0.5,
  },
  passport: {
    requestTimeoutMs: 30 * 1000,
    retryBackoffMs: 5 * 60 * 1000,
  },
  openRank: {
    staleAfterHours: 24,
  },
  priorityAccess: {
    enabled: true,
  },
} as const

type DefaultSeasonConfig = typeof DEFAULT_SEASON_CONFIG
export type SeasonRuntimeConfig = DefaultSeasonConfig & Record<string, unknown>

export type SeasonWithConfig = Omit<Season, "config"> & {
  config: SeasonRuntimeConfig
}

export const getSeasonById = cache(
  async (seasonId: string): Promise<SeasonWithConfig | null> => {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
    })

    return hydrateSeason(season)
  },
)

export const getActiveSeason = cache(
  async (): Promise<SeasonWithConfig | null> => {
    const envSeasonId = process.env.ACTIVE_CITIZEN_SEASON

    if (envSeasonId) {
      const forcedSeason = await getSeasonById(envSeasonId)
      if (forcedSeason) {
        return forcedSeason
      }
    }

    const season = await prisma.season.findFirst({
      where: { active: true },
      orderBy: { startDate: "desc" },
    })

    return hydrateSeason(season)
  },
)

export const getSeasonOrThrow = cache(
  async (seasonId: string): Promise<SeasonWithConfig> => {
    const season = await getSeasonById(seasonId)
    if (!season) {
      throw new Error(`Season ${seasonId} not found`)
    }
    return season
  },
)

export function resolveSeasonConfig(
  rawConfig: Prisma.JsonValue | null | undefined,
): SeasonRuntimeConfig {
  if (!isPlainObject(rawConfig)) {
    return cloneConfig(DEFAULT_SEASON_CONFIG)
  }

  return mergeConfig(
    cloneConfig(DEFAULT_SEASON_CONFIG),
    rawConfig as Record<string, unknown>,
  )
}

type SeasonSchedule = Pick<
  Season,
  "registrationStartDate" | "registrationEndDate" | "priorityEndDate"
>

export function isRegistrationOpen(
  season: SeasonSchedule,
  date = new Date(),
): boolean {
  return (
    date >= season.registrationStartDate && date <= season.registrationEndDate
  )
}

export function isPriorityWindowOpen(
  season: SeasonSchedule,
  date = new Date(),
): boolean {
  if (!season.priorityEndDate) {
    return false
  }

  return date < season.priorityEndDate
}

export function hasRegistrationStarted(
  season: SeasonSchedule,
  date = new Date(),
): boolean {
  return date >= season.registrationStartDate
}

export function hasRegistrationEnded(
  season: SeasonSchedule,
  date = new Date(),
): boolean {
  return date > season.registrationEndDate
}

function hydrateSeason(season: Season | null): SeasonWithConfig | null {
  if (!season) {
    return null
  }

  return {
    ...season,
    config: resolveSeasonConfig(season.config),
  }
}

function cloneConfig(config: DefaultSeasonConfig): DefaultSeasonConfig {
  return JSON.parse(JSON.stringify(config)) as DefaultSeasonConfig
}

function mergeConfig<T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown>,
): T {
  const result: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(override)) {
    if (!isMergeable(value)) {
      result[key] = value
      continue
    }

    const existing = result[key]
    if (isMergeable(existing)) {
      result[key] = mergeConfig(
        existing as Record<string, unknown>,
        value as Record<string, unknown>,
      )
    } else {
      result[key] = value
    }
  }

  return result as T
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function isMergeable(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value)
}
