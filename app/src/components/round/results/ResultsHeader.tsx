"use client"

import { useSession } from "next-auth/react"
import React from "react"

import { Account } from "@/components/common/Account"
import { useAnalytics } from "@/providers/AnalyticsProvider"

const ResultsHeader = () => {
  const { data: session, status } = useSession()
  const { track } = useAnalytics()

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap gap-4">
        <div className="flex flex-col w-full">
          <h1 className="text-4xl font-semibold text-text-default">
            Recipients
          </h1>
          <p className="mt-2 text-base font-normal text-text-secondary">
            Explore the projects that have received Retro Funding
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResultsHeader
