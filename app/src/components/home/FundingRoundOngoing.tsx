"use client"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useMemo } from "react"
import { optimism } from "viem/chains"

import { FundingRound } from "@/lib/mocks"
import { cn, titlecase } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import { ChainLogo } from "../common/ChainLogo"
import ExternalLink from "../ExternalLink"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { FundingRoundPast } from "./FundingRoundPast"

export function FundingRoundOngoing({
  fundingRound,
}: {
  fundingRound: FundingRound
}) {
  const router = useRouter()
  const { status } = useSession()
  return (
    <>
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col gap-y-4 justify-start">
          <div className="flex justify-between">
            <div className="w-full flex flex-col justify-between gap-y-1">
              <div className="w-full flex justify-between space-x-2">
                <h2 className="text-base font-semibold text-text-default text-start">
                  {fundingRound.name}
                </h2>
                {(fundingRound.status === "upcoming" ||
                  !fundingRound.endsAt ||
                  fundingRound.endsAt >= new Date()) && (
                  <Badge
                    className={`text-xs font-medium text-blue-800 border-0 ${
                      fundingRound.status === "open"
                        ? "bg-callout-foreground hover:bg-callout-foreground text-white"
                        : "bg-calloutAlternative-foreground"
                    }`}
                    variant={
                      fundingRound.status === "open" ? "secondary" : "outline"
                    }
                  >
                    {titlecase("Open")}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-x-1.5">
                <p className="text-base font-normal text-secondary-foreground">
                  {fundingRound.endsAt && (
                    <span className="text-base font-normal text-secondary-foreground">
                      {format(fundingRound.startsAt, "MMM d")} -
                      {" " + format(fundingRound.endsAt, "MMMM d, yyyy")}
                    </span>
                  )}
                </p>
              </div>
              {fundingRound.iconUrl && (
                <Image
                  src={fundingRound.iconUrl}
                  width={124}
                  height={124}
                  className="rounded-md"
                  alt="Sunny blobs"
                />
              )}
            </div>
          </div>
          <p className="text-secondary-foreground text-start line-clamp-3">
            {fundingRound.details}
          </p>
        </div>
      </div>
    </>
  )
}
