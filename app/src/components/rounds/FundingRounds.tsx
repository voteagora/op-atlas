"use client"
import { format } from "date-fns"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useMemo } from "react"

import ExtendedLink from "@/components/common/ExtendedLink"
import { useUserApplications } from "@/hooks/db/useUserApplications"
import { FundingRoundData, MissionData } from "@/lib/MissionsAndRoundData"
import { cn, titlecase } from "@/lib/utils"

import { Badge } from "../ui/badge"
import { FundingRoundOngoing } from "./FundingRoundOngoing"
import { FundingRoundPast } from "./FundingRoundPast"

export const FundingRounds = ({
  className,
  fundingRounds,
}: {
  className?: string
  fundingRounds: FundingRoundData[]
}) => {
  const { open, upcoming, past, ongoing } = useMemo(() => {
    const n: FundingRoundData[] = []
    const u: FundingRoundData[] = []
    const p: FundingRoundData[] = []
    const o: FundingRoundData[] = []

    fundingRounds.forEach((round) => {
      switch (round.status) {
        case "open":
          n.push(round)
          break
        case "upcoming":
          u.push(round)
          break
        case "past":
          p.push(round)
          break
        case "ongoing":
          o.push(round)
          break
      }
    })

    return { open: n, upcoming: u, past: p, ongoing: o }
  }, [fundingRounds])

  const renderSection = (
    status: "open" | "upcoming" | "past" | "ongoing",
    rounds: FundingRoundData[],
  ) => {
    return (
      <div className="flex flex-col gap-y-4">
        <div className="h-8">
          <h3 className="text-xl font-normal text-foreground">
            {status === "open" ? "Open for applications" : titlecase(status)}
          </h3>
        </div>

        <div
          className={`grid grid-cols-1 gap-4 ${
            status === "ongoing" ? "flex flex-wrap md:grid-cols-2" : ""
          }`}
        >
          {rounds.map((fundingRound) => (
            <Round key={fundingRound.number} fundingRound={fundingRound} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-y-12 w-full", className)}>
      {ongoing.length > 0 && renderSection("ongoing", ongoing)}
      {past.length > 0 && renderSection("past", past)}
      {open.length > 0 && renderSection("open", open)}
      {upcoming.length > 0 && renderSection("upcoming", upcoming)}
    </div>
  )
}

const Round = ({
  className,
  fundingRound,
}: {
  className?: string
  fundingRound: FundingRoundData
}) => {
  const router = useRouter()

  const { data: applications } = useUserApplications()

  let SelectedContent: React.ReactNode

  if (fundingRound.status === "past") {
    SelectedContent = <FundingRoundPast fundingRound={fundingRound} />
  } else if (fundingRound.status === "ongoing") {
    let userApplicationState: "Open" | "Active" | "Coming Soon" = "Open"

    if (fundingRound.startsAt && new Date() < fundingRound.startsAt) {
      userApplicationState = "Coming Soon"
    } else if (applications) {
      userApplicationState =
        applications.filter(
          (app) => app.roundId === fundingRound.number.toString(),
        ).length > 0
          ? "Active"
          : "Open"
    }
    SelectedContent = (
      <FundingRoundOngoing
        fundingRound={fundingRound as MissionData}
        userApplicationState={userApplicationState}
      />
    )
  } else {
    SelectedContent = <FundingRoundContent fundingRound={fundingRound} />
  }

  const content = (
    <div className={cn(`flex flex-2 gap-x-1 border rounded-xl`, className)}>
      {SelectedContent}
    </div>
  )

  return content
}

function FundingRoundContent({
  fundingRound,
}: {
  fundingRound: FundingRoundData
}) {
  const router = useRouter()
  const { status } = useSession()
  return (
    <div className="p-10">
      {fundingRound.status !== "past" && fundingRound.iconUrl && (
        <Image
          src={fundingRound.iconUrl}
          width={124}
          height={124}
          className="rounded-md self-center"
          alt="Sunny blobs"
        />
      )}
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col gap-y-4">
          <div className="flex justify-between">
            <div className="w-full flex flex-col justify-between gap-y-1">
              <div className="w-full flex justify-between space-x-2">
                <h2 className="text-base font-normal text-text-default text-start">
                  Round {fundingRound.number}
                  {fundingRound.number > 3 ? ": " + fundingRound.name : ""}
                </h2>
                {(fundingRound.status === "upcoming" ||
                  !fundingRound.endsAt ||
                  fundingRound.endsAt >= new Date()) && (
                  <Badge
                    className={`text-xs font-normal text-foreground ${
                      fundingRound.status === "open"
                        ? "bg-callout-foreground hover:bg-callout-foreground text-white"
                        : "bg-secondary"
                    }`}
                    variant={
                      fundingRound.status === "open" ? "secondary" : "outline"
                    }
                  >
                    {titlecase(fundingRound.status)}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-x-1.5">
                <p className="text-base font-normal text-secondary-foreground">
                  {fundingRound.status === "open" && fundingRound.endsAt ? (
                    <span className="text-base font-normal text-secondary-foreground">
                      {fundingRound.endsAt < new Date()
                        ? "Applications are closed"
                        : `Apply by ${format(fundingRound.endsAt, "MMMM d")}`}
                    </span>
                  ) : (
                    <span className="font-normal text-secondary-foreground">
                      {fundingRound.startsAt &&
                        format(fundingRound.startsAt, "MMM yyyy")}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          {fundingRound.status !== "past" && (
            <p className="text-secondary-foreground text-start line-clamp-3">
              {fundingRound.details}
            </p>
          )}

          {fundingRound.status === "open" && (
            <div className="flex justify-between text-secondary-foreground text-sm font-normal">
              <div className="items-center flex gap-2 pr-4 ">
                <Image
                  src="/assets/icons/op-icon.svg"
                  height={24}
                  width={24}
                  alt="Optimism"
                />
                <div className="text-sm font-normal text-secondary-foreground">
                  {fundingRound.funding?.op && (
                    <span>{fundingRound.funding.op}</span>
                  )}{" "}
                </div>
              </div>
              <ExtendedLink href="/application/6" text="View application" />
            </div>
          )}
        </div>

        {fundingRound.status === "past" && (
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-row items-center gap-2 text-sm font-normal text-secondary-foreground">
              {fundingRound.funding?.op && (
                <Image
                  src="/assets/icons/op-icon.svg"
                  height={24}
                  width={24}
                  alt="Optimism"
                />
              )}
              <div>
                {fundingRound.funding?.op && (
                  <span>{fundingRound.funding.op} OP</span>
                )}{" "}
                {fundingRound.funding?.dollar && (
                  <span>{fundingRound.funding.dollar}</span>
                )}
              </div>
            </div>
            {fundingRound.resultsLink && (
              <ExtendedLink
                href={fundingRound.resultsLink}
                as="button"
                text="View results"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
