import "server-only"

import { cache } from "react"
import { Prisma, Season } from "@prisma/client"

import { prisma } from "@/db/client"

export type SeasonRuntimeConfig = Record<string, unknown>

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
    return {}
  }

  return cloneConfig(rawConfig as Record<string, unknown>)
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

function cloneConfig(config: Record<string, unknown>): SeasonRuntimeConfig {
  return JSON.parse(JSON.stringify(config)) as SeasonRuntimeConfig
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}
