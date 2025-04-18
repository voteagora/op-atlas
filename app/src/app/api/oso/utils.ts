import { MetricValues } from "@/lib/oso/types"
import { INDEXED_MONTHS } from "@/lib/oso/constants"
import { Trend } from "@/lib/oso/types"

const calculateTrend = (current: number, previous: number): Trend => {
  if (previous === 0) return { value: 0, sign: null }

  const diff = current - previous
  const percentageChange = Math.abs((diff / previous) * 100)

  return {
    value: parseFloat(percentageChange.toFixed(2)),
    sign: diff > 0 ? "inc" : diff < 0 ? "dec" : null,
  }
}

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

export const formatOnchainBuilderReward = (data: MetricValues[]) => {
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
