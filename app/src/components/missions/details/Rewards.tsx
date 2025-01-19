"use client"

import React from "react"

export default function Rewards({ rewards }: { rewards: any }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-xl font-semibold">Rewards</p>
      <p className="font-light">
        Your impact will be rewarded based on the following criteria:
      </p>

      <ol className="list-decimal pl-6">
        {rewards.criteria.map((element: any, index: number) => {
          return <li key={"rewards" + index}>{element}</li>
        })}
      </ol>
      {rewards.measurement}
    </div>
  )
}
