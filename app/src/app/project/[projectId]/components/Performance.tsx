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
  return (
    <div className="w-full space-y-6">
      <div className="w-full flex items-center">
        <h4 className="font-semibold text-xl">Performance</h4>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-2 gap-3">
          <div className="w-full space-y-6 rounded-lg border p-6">
            <div>
              <h4 className="font-semibold text-foreground">
                $
                {formatNumber(
                  Object.values(metrics.tvl).reduce(
                    (acc, curr) => acc + curr.value,
                    0,
                  ) / 30,
                  0,
                  "compact",
                )}
              </h4>
              <p className="text-secondary-foreground">
                TVL across the Superchain
              </p>
            </div>
            <Chart data={metrics.tvl} />
          </div>
          <div className="w-full space-y-6 rounded-lg border p-6">
            <div>
              <h4 className="font-semibold text-foreground">
                {formatNumber(
                  Object.values(metrics.transactions).reduce(
                    (acc, curr) => acc + curr.value,
                    0,
                  ),
                  0,
                  "compact",
                )}
              </h4>
              <p className="text-secondary-foreground">Transactions</p>
            </div>
            <Chart data={metrics.transactions} />
          </div>
          <div className="w-full space-y-6 rounded-lg border p-6">
            <div>
              <h4 className="font-semibold text-foreground">
                {formatNumber(
                  Object.values(metrics.gasFees).reduce(
                    (acc, curr) => acc + curr.value,
                    0,
                  ),
                  0,
                  "compact",
                )}{" "}
                ETH
              </h4>
              <p className="text-secondary-foreground">Gas consumed</p>
            </div>
            <Chart data={metrics.gasFees} />
          </div>
          <div className="w-full space-y-6 rounded-lg border p-6">
            <div>
              <h4 className="font-semibold text-foreground">
                {formatNumber(
                  Object.values(metrics.activeAddresses).reduce(
                    (acc, curr) => acc + curr.value,
                    0,
                  ) / 30,
                  0,
                  "compact",
                )}
              </h4>
              <p className="text-secondary-foreground">Unique addresses</p>
            </div>
            <Chart data={metrics.activeAddresses} />
          </div>
        </div>
      </div>
    </div>
  )
}
