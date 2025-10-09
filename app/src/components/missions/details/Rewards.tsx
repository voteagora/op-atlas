"use client"

import React from "react"

import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"

export default function Rewards() {
  const mission = useMissionFromPath()
  if (!mission?.rewards) {
    return null
  }
  return (
    <div className="flex flex-col gap-6">
      <p className="text-xl font-normal">How impact is measured</p>
      <ol className="list-decimal pl-6">
        {mission?.rewards?.criteria?.map((element: string, index: number) => {
          return (
            <li key={"rewards" + index} className="text-secondary-foreground">
              {element}
            </li>
          )
        })}
      </ol>
      {mission?.rewards?.measurement}
    </div>
  )
}
