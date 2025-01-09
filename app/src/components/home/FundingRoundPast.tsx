"use client"
import { format } from "date-fns"
import Link from "next/link"
import { FundingRound } from "@/lib/mocks"
import { Button } from "../ui/button"

export function FundingRoundPast({
  fundingRound,
}: {
  fundingRound: FundingRound
}) {
  return (
    <>
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col gap-y-1">
          <h2 className="text-base font-semibold text-text-default text-start">
            {fundingRound.name}
          </h2>
          <span className="font-normal text-secondary-foreground">
            {format(fundingRound.startsAt, "MMM d, yyyy")}
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
    </>
  )
}
