"use client"

import React from "react"

import Chart from "@/components/common/Chart"
import { PerformanceMetrics } from "@/lib/oso/types"
import { formatNumber } from "@/lib/utils"

export default function Performance({
  metrics,
}: {
  metrics: PerformanceMetrics
}) {
  const tvlValues = Object.values(metrics.tvl)
  const transactionsValues = Object.values(metrics.transactions)
  const gasFeesValues = Object.values(metrics.gasFees)
  const activeAddressesValues = Object.values(metrics.activeAddresses)

  // TVL: average across all months (values are already totals per month)
  const avgTvl = tvlValues.reduce((acc, curr) => acc + curr.value, 0) / tvlValues.length

  // Transactions: sum of all months
  const totalTransactions = transactionsValues.reduce((acc, curr) => acc + curr.value, 0)

  // Gas Fees: sum of all months
  const totalGasFees = gasFeesValues.reduce((acc, curr) => acc + curr.value, 0)

  // Active Addresses: average across all months (values are already daily averages)
  const avgActiveAddresses = activeAddressesValues.reduce((acc, curr) => acc + curr.value, 0) / activeAddressesValues.length

  return (
    <div className="w-full space-y-6">
      <div className="w-full flex items-center">
        <h4 className="font-normal text-xl">Performance</h4>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-2 gap-3">
          <div className="w-full space-y-6 rounded-lg border p-6">
            <div>
              <h4 className="font-normal text-foreground">
                $
                {formatNumber(avgTvl, 0, "compact")}
              </h4>
              <p className="text-secondary-foreground">
                Average TVL across the Superchain
              </p>
            </div>
            <Chart data={metrics.tvl} />
          </div>
          <div className="w-full space-y-6 rounded-lg border p-6">
            <div>
              <h4 className="font-normal text-foreground">
                {formatNumber(totalTransactions, 0, "compact")}
              </h4>
              <p className="text-secondary-foreground">Total Transactions</p>
            </div>
            <Chart data={metrics.transactions} />
          </div>
          <div className="w-full space-y-6 rounded-lg border p-6">
            <div>
              <h4 className="font-normal text-foreground">
                {formatNumber(totalGasFees, 0, "compact")}{" "}
                ETH
              </h4>
              <p className="text-secondary-foreground">Total Gas consumed</p>
            </div>
            <Chart data={metrics.gasFees} />
          </div>
          <div className="w-full space-y-6 rounded-lg border p-6">
            <div>
              <h4 className="font-normal text-foreground">
                {formatNumber(avgActiveAddresses, 0, "compact")}
              </h4>
              <p className="text-secondary-foreground">Average Daily Unique addresses</p>
            </div>
            <Chart data={metrics.activeAddresses} />
          </div>
        </div>
      </div>
    </div>
  )
}
