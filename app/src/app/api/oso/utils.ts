import { MetricValues } from "./types"
import { INDEXED_MONTHS } from "./constants"

export const formatActiveAddresses = (data: MetricValues[]) => {
  return groupByMonth(data)
}

export const formatGasFees = (data: MetricValues[]) => {
  return groupByMonth(data)
}

export const formatTransactions = (data: MetricValues[]) => {
  return groupByMonth(data)
}

export const formatTvl = (data: MetricValues[]) => {
  return groupByMonth(data)
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
