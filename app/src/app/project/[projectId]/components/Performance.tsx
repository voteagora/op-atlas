"use client"

import React, { useMemo } from "react"

import Chart from "@/components/common/Chart"
import { abbreviateNumber } from "@/lib/utils"

interface MetricEntry {
  date: string
  value: number
  month: string
}

interface PerformanceProps {
  data: {
    activeAddresses: Record<string, number>
    gasFees: Record<string, number>
    transactions: Record<string, number>
    tvl: Record<string, number>
    opReward?: number
  }
}

export default function Performance({ data }: PerformanceProps) {
  const hasAnyData = useMemo(
    () =>
      [data.activeAddresses, data.gasFees, data.transactions, data.tvl].some(
        (metric) => metric && Object.keys(metric).length > 0,
      ),
    [data],
  )

  const { start, end } = useMemo(
    () =>
      getGlobalDateRange([
        data.activeAddresses,
        data.gasFees,
        data.transactions,
        data.tvl,
      ]),
    [data],
  )

  const performanceCharts = useMemo(() => {
    const formatAndFill = (
      metric: Record<string, number>,
      options?: { roundLargeValues?: boolean },
    ) =>
      fillMetricWithFullRange(metric, start, end).map((item) => ({
        ...item,
        value:
          options?.roundLargeValues && item.value > 1
            ? Math.round(item.value)
            : item.value,
      }))

    return [
      {
        value: formatCurrency(getLastValue(data.tvl)),
        title: "TVL across the Superchain",
        data: formatAndFill(data.tvl, { roundLargeValues: true }),
      },
      {
        value: formatEth(getLastValue(data.gasFees)),
        title: "Gas consumed",
        data: formatAndFill(data.gasFees),
      },
      {
        value: getLastValue(data.transactions).toLocaleString(),
        title: "Transactions",
        data: formatAndFill(data.transactions),
      },
      {
        value: getLastValue(data.activeAddresses).toLocaleString(),
        title: "Unique addresses",
        data: formatAndFill(data.activeAddresses),
      },
    ]
  }, [data, start, end])

  if (!hasAnyData) return null

  return (
    <div className="w-full space-y-6">
      <div className="w-full flex items-center">
        <h4 className="font-semibold text-xl">Performance</h4>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-2 gap-3">
          {performanceCharts.map(({ value, title, data }, index) => (
            <div key={index} className="w-full space-y-6 rounded-lg border p-6">
              <div>
                <h4 className="font-semibold text-foreground">{value}</h4>
                <p className="text-secondary-foreground">{title}</p>
              </div>
              <Chart data={data} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Fill missing days between start and end with 0s if they don’t exist
function fillMetricWithFullRange(
  original: Record<string, number>,
  start: Date,
  end: Date,
): MetricEntry[] {
  const filledData: MetricEntry[] = []

  for (
    let current = new Date(start);
    current <= end;
    current.setDate(current.getDate() + 1)
  ) {
    const dateStr = current.toISOString().split("T")[0]
    const value = original[dateStr] ?? 0
    filledData.push({
      date: dateStr,
      value,
      month: current.toLocaleString("en-US", { month: "short" }),
    })
  }

  return filledData
}

// Get the global min/max date across all provided metric objects
function getGlobalDateRange(metrics: Record<string, number>[]): {
  start: Date
  end: Date
} {
  const allDates = metrics.flatMap((m) => Object.keys(m))
  const sorted = allDates.sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  )
  const start = new Date(sorted[0])
  const end = new Date(sorted[sorted.length - 1])
  return { start, end }
}

function getLastValue(data: Record<string, number>): number {
  const sorted = Object.entries(data).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
  )
  return sorted.at(-1)?.[1] ?? 0
}

function formatCurrency(value: number): string {
  if (value === 0) return "$0"
  return `$${abbreviateNumber(value)}`
}

function formatEth(value: number): string {
  if (value === 0) return "0 ETH"

  // Keep full precision temporarily
  const fixed = value.toFixed(18)
  const trimmed = fixed.replace(/\.?0+$/, "")
  const [intPart, decPart = ""] = trimmed.split(".")

  // If no decimal part, just return
  if (!decPart) return `${intPart} ETH`

  // Handle very small values: < 0.001
  if (value < 0.001) {
    return `${intPart}.${decPart} ETH` // keep full meaningful precision
  }

  // Normal values: show max 3 decimals, round it
  const rounded = Number(value.toFixed(3)).toString()
  return `${rounded} ETH`
}
