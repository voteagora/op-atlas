import { MetricValues } from "./types"
import { INDEXED_MONTHS, RETROFUNDING_OP_REWARD_MINIMUM } from "./constants"
import { Trend } from "./types"
import { CHAIN_INFO } from "@/components/common/chain"

export const formatPerformanceMetrics = (metrics: MetricValues[]) => {
  return groupByDate(metrics)
}

const calculateTrend = (current: number, previous: number): Trend => {
  if (previous === 0) return { value: 0, sign: null }

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

export const formatActiveAddresses = (data: MetricValues[]) => {
  const monthlyData = groupByMonth(data)
  const months = Object.keys(monthlyData)
  const result: Record<string, { value: number; trend: Trend }> = {}

  months.forEach((month, index) => {
    const currentValue = monthlyData[month]
    const previousValue = index > 0 ? monthlyData[months[index - 1]] : 0
    result[month] = {
      value: currentValue,
      trend: calculateTrend(currentValue, previousValue),
    }
  })

  return result
}

export const formatGasFees = (data: MetricValues[]) => {
  const monthlyData = groupByMonth(data)
  const months = Object.keys(monthlyData)
  const result: Record<string, { value: number; trend: Trend }> = {}

  months.forEach((month, index) => {
    const currentValue = monthlyData[month]
    const previousValue = index > 0 ? monthlyData[months[index - 1]] : 0
    result[month] = {
      value: currentValue,
      trend: calculateTrend(currentValue, previousValue),
    }
  })

  return result
}

export const formatTransactions = (data: MetricValues[]) => {
  const monthlyData = groupByMonth(data)
  const months = Object.keys(monthlyData)
  const result: Record<string, { value: number; trend: Trend }> = {}

  months.forEach((month, index) => {
    const currentValue = monthlyData[month]
    const previousValue = index > 0 ? monthlyData[months[index - 1]] : 0
    result[month] = {
      value: currentValue,
      trend: calculateTrend(currentValue, previousValue),
    }
  })

  return result
}

export const formatTvl = (data: MetricValues[]) => {
  const monthlyData = groupByMonth(data)
  const months = Object.keys(monthlyData)
  const result: Record<string, { value: number; trend: Trend }> = {}
  const currentYear = new Date().getFullYear()

  months.forEach((month, index) => {
    const daysInMonth = getDaysInMonth(month, currentYear)
    const currentValue = monthlyData[month] / daysInMonth
    const previousValue =
      index > 0
        ? monthlyData[months[index - 1]] /
          getDaysInMonth(months[index - 1], currentYear)
        : 0
    result[month] = {
      value: currentValue,
      trend: calculateTrend(currentValue, previousValue),
    }
  })

  return result
}

export const formatOnchainBuilderReward = (data: MetricValues[]) => {
  return groupByMonth(data)
}

export const formatDevToolingReward = (data: MetricValues[]) => {
  return groupByMonth(data)
}

export const formatOnchainBuilderEligibility = (data: MetricValues[]) => {
  const sum = data.reduce((acc, metric) => acc + metric.amount, 0)
  return getIsProjectEligibleByReward(sum)
}

export const formatDevToolingEligibility = (data: MetricValues[]) => {
  const sum = data.reduce((acc, metric) => acc + metric.amount, 0)
  return getIsProjectEligibleByReward(sum)
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
