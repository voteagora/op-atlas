"use client"
import { format } from "date-fns"
import Link from "next/link"

import { FundingRoundData } from "@/lib/MissionsAndRoundData"

import { Button } from "../ui/button"

export function FundingRoundPast({
  fundingRound,
}: {
  fundingRound: FundingRoundData
}) {
  return (
    <div className="flex justify-between items-center w-full p-10">
      <div className="flex flex-col gap-y-1">
        <h2 className="text-base font-semibold text-text-default text-start">
          {fundingRound.name}
        </h2>
        <span className="font-normal text-secondary-foreground">
          {fundingRound.startsAt &&
            format(fundingRound.startsAt, "MMM d, yyyy")}
        </span>
      </div>

      {fundingRound.resultsLink && (
        <Link href={fundingRound.resultsLink}>
          <Button
            variant="secondary"
            className="text-sm font-medium text-foreground"
          >
            View results
          </Button>
        </Link>
      )}
    </div>
  )
}
