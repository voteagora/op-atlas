import { MetricValues } from "./types"
import {
  INDEXED_MONTHS,
  RETROFUNDING_OP_REWARD_MINIMUM,
  TRANCHE_MONTHS_MAP,
} from "./constants"
import { Trend } from "./types"
import { CHAIN_INFO } from "@/components/common/chain"
import { formatUnits } from "viem"

export const formatPerformanceMetrics = (metrics: MetricValues[]) => {
  const groupedData = groupByDate(metrics)
  const result: Record<string, { value: number; trend: Trend }> = {}
  const months = Object.keys(groupedData)

  months.forEach((month, index) => {
    const currentValue = groupedData[month]
    const previousValue = index > 0 ? groupedData[months[index - 1]] : 0

    result[month] = {
      value: currentValue,
      trend: calculateTrend(currentValue, previousValue),
    }
  })

  return result
}

const calculateTrend = (current: number, previous: number): Trend => {
  if (previous === 0 || current === 0) return { value: 0, sign: null }

  const diff = current - previous
  const percentageChange = Math.abs((diff / previous) * 100)

  return {
    value: parseFloat(percentageChange.toFixed(2)),
    sign: diff > 0 ? "inc" : diff < 0 ? "dec" : null,
  }
}

const getDaysInMonth = (month: string, year: number): number => {
  const monthIndex = Object.values(INDEXED_MONTHS).indexOf(month) + 1
  return new Date(year, monthIndex, 0).getDate()
}

export const formatActiveAddresses = (
  data: Record<string, { tranche: number; value: string }[]>,
) => {
  const result: Record<string, { value: number; trend: Trend }> = {}
  const months = Object.keys(data)

  months.forEach((month, index) => {
    const currentMonthData = data[month]
    const currentValue = currentMonthData.reduce(
      (sum, item) => sum + Number(item.value),
      0,
    )
    const previousValue =
      index > 0
        ? data[months[index - 1]].reduce(
            (sum, item) => sum + Number(item.value),
            0,
          )
        : 0

    result[month] = {
      value: currentValue,
      trend: calculateTrend(currentValue, previousValue),
    }
  })

  return result
}

export const formatGasFees = (
  data: Record<string, { tranche: number; value: string }[]>,
) => {
  const result: Record<string, { value: number; trend: Trend }> = {}
  const months = Object.keys(data)

  months.forEach((month, index) => {
    const currentMonthData = data[month]
    const currentValue = currentMonthData.reduce(
      (sum, item) => sum + Number(item.value),
      0,
    )
    const previousValue =
      index > 0
        ? data[months[index - 1]].reduce(
            (sum, item) => sum + Number(item.value),
            0,
          )
        : 0

    result[month] = {
      value: currentValue,
      trend: calculateTrend(currentValue, previousValue),
    }
  })

  return result
}

export const formatTransactions = (
  data: Record<string, { tranche: number; value: string }[]>,
) => {
  const result: Record<string, { value: number; trend: Trend }> = {}
  const months = Object.keys(data)

  months.forEach((month, index) => {
    const currentMonthData = data[month]
    const currentValue = currentMonthData.reduce(
      (sum, item) => sum + Number(item.value),
      0,
    )
    const previousValue =
      index > 0
        ? data[months[index - 1]].reduce(
            (sum, item) => sum + Number(item.value),
            0,
          )
        : 0

    result[month] = {
      value: currentValue,
      trend: calculateTrend(currentValue, previousValue),
    }
  })

  return result
}

export const formatTvl = (
  data: Record<string, { tranche: number; value: string }[]>,
) => {
  const result: Record<string, { value: number; trend: Trend }> = {}
  const months = Object.keys(data)

  months.forEach((month, index) => {
    const currentMonthData = data[month]
    const currentValue = currentMonthData.reduce(
      (sum, item) => sum + Number(item.value),
      0,
    )
    const previousValue =
      index > 0
        ? data[months[index - 1]].reduce(
            (sum, item) => sum + Number(item.value),
            0,
          )
        : 0

    result[month] = {
      value: currentValue,
      trend: calculateTrend(currentValue, previousValue),
    }
  })

  return result
}

export const formatOnchainBuilderReward = (
  data: {
    amount: string
    tranche: number
  }[],
) => {
  return data.reduce<Record<string, { value: number }>>((acc, d) => {
    acc[TRANCHE_MONTHS_MAP[d.tranche as keyof typeof TRANCHE_MONTHS_MAP]] = {
      value: Number(formatUnits(BigInt(d.amount), 16)) / 100,
    }
    return acc
  }, {})
}

export const formatDevToolingReward = (
  data: {
    amount: string
    tranche: number
  }[],
) => {
  return data.reduce<Record<string, { value: number }>>((acc, d) => {
    acc[TRANCHE_MONTHS_MAP[d.tranche as keyof typeof TRANCHE_MONTHS_MAP]] = {
      value: Number(formatUnits(BigInt(d.amount), 16)) / 100,
    }
    return acc
  }, {})
}

// TODO: Use this for Performance Metrics
const groupByDate = (metrics: MetricValues[]) => {
  return metrics.reduce<Record<string, number>>((acc, metric) => {
    if (!acc[metric.sampleDate]) {
      acc[metric.sampleDate] = 0
    }
    acc[metric.sampleDate] += metric.amount
    return acc
  }, {})
}
// End Performance Metrics

const groupByMonth = (metrics: MetricValues[]) => {
  return metrics.reduce<Record<string, number>>((acc, metric) => {
    const monthIndex = new Date(metric.sampleDate).getMonth() + 1 // +1 because INDEXED_MONTHS is 1-based
    const month =
      INDEXED_MONTHS[monthIndex as keyof typeof INDEXED_MONTHS] || "January"

    if (!acc[month]) {
      acc[month] = 0
    }
    acc[month] += metric.amount
    return acc
  }, {})
}

export const getIsProjectEligibleByReward = (reward: number) => {
  return reward >= RETROFUNDING_OP_REWARD_MINIMUM
}

export const getProjectRewards = (
  rewards: { roundId: string; amount: any }[],
) => {
  const devToolingRewards = rewards
    .filter((r) => r.roundId === "7")
    .reduce((sum, r) => sum + Number(r.amount), 0)

  const onchainBuildersRewards = rewards
    .filter((r) => r.roundId === "8")
    .reduce((sum, r) => sum + Number(r.amount), 0)

  return {
    devToolingRewards,
    onchainBuildersRewards,
  }
}

export const getProjectDeployedChains = (contracts: { chainId: number }[]) => {
  const deployedOn = contracts.map((c) => CHAIN_INFO[c.chainId]).filter(Boolean)

  return Array.from(new Map(deployedOn.map((c) => [c.name, c])).values())
}

export const getProjectContributors = (
  team: { user: any }[],
  organization: {
    organization?: {
      name: string
      avatarUrl: string | null
      team: { user: any }[]
    } | null
  } | null,
) => {
  const teamUsers = team.map((t) => t.user)
  const orgUsers = organization?.organization?.team?.map((t) => t.user) || []

  return teamUsers.filter((u) => !orgUsers.find((ou) => ou.id === u.id))
}

export const getReposWithTags = (
  repos: { openSource?: boolean; npmPackage?: boolean; crate?: boolean }[],
) => {
  return repos.map((repo) => {
    const tags = []
    if (repo.openSource)
      tags.push({ name: "Open Source", icon: "/assets/icons/oss.svg" })
    if (repo.npmPackage)
      tags.push({ name: "NPM", icon: "/assets/icons/npm-fill.svg" })
    if (repo.crate)
      tags.push({ name: "Crate", icon: "/assets/icons/crate.svg" })
    return { ...repo, tags }
  })
}

export const formatGasConsumption = (
  data: Record<string, { tranche: number; value: string }[]>,
) => {
  const result: Record<string, { value: number; trend: Trend }> = {}
  const months = Object.keys(data)

  months.forEach((month, index) => {
    const currentMonthData = data[month]
    const currentValue = currentMonthData.reduce(
      (sum, item) => sum + Number(item.value),
      0,
    )
    const previousValue =
      index > 0
        ? data[months[index - 1]].reduce(
            (sum, item) => sum + Number(item.value),
            0,
          )
        : 0

    result[month] = {
      value: currentValue,
      trend: calculateTrend(currentValue, previousValue),
    }
  })

  return result
}

export const formatDevToolingEligibility = (
  data: {
    tranche: number
    value: string
  }[],
) => {
  return data.reduce<Record<string, boolean>>((acc, d) => {
    acc[TRANCHE_MONTHS_MAP[d.tranche as keyof typeof TRANCHE_MONTHS_MAP]] =
      d.value === "true"
    return acc
  }, {})
}

export const formatOnchainBuilderEligibility = (
  data: {
    tranche: number
    value: string
  }[],
) => {
  return data.reduce<Record<string, boolean>>((acc, d) => {
    acc[TRANCHE_MONTHS_MAP[d.tranche as keyof typeof TRANCHE_MONTHS_MAP]] =
      d.value === "true"
    return acc
  }, {})
}

export const formatEnrollement = (
  data: {
    tranche: number
    value: string
  }[],
): Record<string, boolean> => {
  return Object.keys(TRANCHE_MONTHS_MAP).reduce((acc, month) => {
    acc[TRANCHE_MONTHS_MAP[Number(month) as keyof typeof TRANCHE_MONTHS_MAP]] =
      !!data.find((d) => d.tranche === Number(month))
    return acc
  }, {} as Record<string, boolean>)
}

export const formatHasDefillamaAdapter = (
  data: { tranche: number; value: string }[],
) => {
  return data.reduce<Record<string, boolean>>((acc, d) => {
    acc[TRANCHE_MONTHS_MAP[d.tranche as keyof typeof TRANCHE_MONTHS_MAP]] =
      d.value === "true"
    return acc
  }, {})
}

// Helper functions to parse combined query results
export function parseEligibilityResults(
  results: { metric: string; value: string; tranche: number }[],
  metric: string,
) {
  return results.filter((r) => r.metric === metric)
}

export function parseMetricsResults(
  results: { metric: string; value: string; tranche: number }[],
  metric: string,
) {
  return results.filter((r) => r.metric === metric)
}

export function parseRewardsResults(
  results: { roundId: string; amount: string; tranche: number }[],
  roundId: string,
) {
  return results.filter((r) => r.roundId === roundId)
}

// Helper function to format metrics data
export function formatMetricsData(
  results: { metric: string; value: string; tranche: number }[],
): Record<string, { tranche: number; value: string }[]> {
  return results.reduce((acc, result) => {
    const month =
      TRANCHE_MONTHS_MAP[result.tranche as keyof typeof TRANCHE_MONTHS_MAP]
    if (!acc[month]) {
      acc[month] = []
    }
    acc[month].push({
      tranche: result.tranche,
      value: result.value,
    })
    return acc
  }, {} as Record<string, { tranche: number; value: string }[]>)
}
