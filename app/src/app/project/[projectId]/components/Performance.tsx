"use client"

import React from "react"

import Chart from "@/components/common/Chart"
import { PerformanceMetrics } from "@/lib/oso/types"

export default function Performance({
  metrics,
}: {
  metrics: PerformanceMetrics
}) {
  const PERFORMANCE_CHARTS = [
    {
      value: Object.values(metrics.activeAddresses).reduce(
        (acc, curr) => acc + curr,
        0,
      ),
      title: "Unique addresses",
      data: metrics.activeAddresses,
    },
    {
      value: Object.values(metrics.gasFees).reduce(
        (acc, curr) => acc + curr,
        0,
      ),
      title: "Gas consumed",
      data: metrics.gasFees,
    },
    {
      value: Object.values(metrics.transactions).reduce(
        (acc, curr) => acc + curr,
        0,
      ),
      title: "Transactions",
      data: metrics.transactions,
    },
    {
      value: Object.values(metrics.tvl).reduce((acc, curr) => acc + curr, 0),
      title: "TVL across the Superchain",
      data: metrics.tvl,
    },
  ]

  return (
    <div className="w-full space-y-6">
      <div className="w-full flex items-center">
        <h4 className="font-semibold text-xl">Performance</h4>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-2 gap-3">
          {PERFORMANCE_CHARTS.map(({ value, title, data }, index) => (
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
