import { MetricValues } from "./types"
import { INDEXED_MONTHS } from "./constants"
import { Trend } from "./types"

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
  return sum >= 200
}

export const formatDevToolingEligibility = (data: MetricValues[]) => {
  const sum = data.reduce((acc, metric) => acc + metric.amount, 0)
  return sum >= 200
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
    const month = INDEXED_MONTHS[monthIndex as keyof typeof INDEXED_MONTHS]

    if (!acc[month]) {
      acc[month] = 0
    }
    acc[month] += metric.amount
    return acc
  }, {})
}
