"use client"

import React from "react"

import Chart from "@/components/common/Chart"

export default function Performance() {
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
