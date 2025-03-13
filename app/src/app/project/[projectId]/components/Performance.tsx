"use client"

import { ChevronDown } from "lucide-react"
import React from "react"

import { Button } from "@/components/common/Button"
import Chart from "@/components/common/Chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Performance() {
  const [selectedChain, setSelectedChain] = React.useState(CHAINS.at(0))
  const [selectedPeriod, setSelectedPeriod] = React.useState(PERIODS.at(0))

  const onSelectChain = (chain: { value: string }) => {
    setSelectedChain(chain)
  }
  const onSelectPeriod = (period: { value: string }) => {
    setSelectedPeriod(period)
  }

  return (
    <div className="w-full space-y-6">
      <div className="w-full flex items-center justify-between">
        <h4 className="font-semibold text-xl">Performance</h4>
        <div className="space-x-2 flex items-cente justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-0 ring-0 min-w-32">
              <Button variant="secondary" className="w-full">
                <span>{selectedChain?.value}</span>
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {CHAINS.map((chain, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => onSelectChain(chain)}
                >
                  {chain.value}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-0 ring-0 min-w-40">
              <Button variant="secondary" className="w-full">
                <span>{selectedPeriod?.value}</span>
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {PERIODS.map((period, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => onSelectPeriod(period)}
                >
                  {period.value}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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

// Mock data
const CHAINS = [
  { value: "All chains" },
  { value: "Optimism" },
  { value: "Arbitrum" },
  { value: "Polygon" },
  { value: "Avalanche" },
  { value: "Binance Smart Chain" },
  { value: "Ethereum" },
  { value: "Fantom" },
  { value: "Harmony" },
  { value: "Near" },
  { value: "Solana" },
  { value: "Tezos" },
  { value: "Tron" },
  { value: "Wanchain" },
  { value: "xDai" },
  { value: "Zilliqa" },
]

const PERIODS = [
  { value: "Last 6 months" },
  { value: "Last 3 months" },
  { value: "Last month" },
  { value: "Last week" },
  { value: "Last 24 hours" },
]

const generateRandomData = () => {
  const startDate = new Date(2024, 0, 1) // Jan 1, 2024
  const endDate = new Date(2024, 6, 31) // July 31, 2024
  const numEntries = Math.floor(Math.random() * (100 - 50 + 1)) + 50 // 50 to 100 entries
  const data = []

  let currentDate = startDate

  while (data.length < numEntries) {
    const value = Math.floor(Math.random() * (500 - 50 + 1)) + 50 // Value between 50 and 500
    const month = currentDate.toLocaleString("en-US", { month: "short" })

    data.push({
      date: currentDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
      value,
      month,
    })

    // Increment by a random number of days (1 to 10) for irregular spacing
    currentDate.setDate(
      currentDate.getDate() + Math.floor(Math.random() * 10) + 1,
    )

    if (currentDate > endDate) break
  }

  return data
}

const PERFORMANCE_CHARTS = [
  {
    value: "$24,000",
    title: "TVL across the Superchain",
    data: generateRandomData(),
  },
  {
    value: "0.05 ETH",
    title: "Gas consumed",
    data: generateRandomData(),
  },
  {
    value: "6K",
    title: "Transactions",
    data: generateRandomData(),
  },
  {
    value: "59",
    title: "Unique addresses",
    data: generateRandomData(),
  },
]
//
