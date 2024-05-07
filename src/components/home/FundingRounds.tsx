"use client"

import { format } from "date-fns"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { optimism } from "viem/chains"

import { FundingRound } from "@/lib/mocks"
import { cn, titlecase } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import { Badge } from "../common/Badge"
import { ChainLogo } from "../common/ChainLogo"

export const FundingRounds = ({
  className,
  fundingRounds,
}: {
  className?: string
  fundingRounds: FundingRound[]
}) => {
  const { now, upcoming, past } = useMemo(() => {
    const n: FundingRound[] = []
    const u: FundingRound[] = []
    const p: FundingRound[] = []

    fundingRounds.forEach((round) => {
      switch (round.status) {
        case "now":
          n.push(round)
          break
        case "upcoming":
          u.push(round)
          break
        case "past":
          p.push(round)
          break
      }
    })

    return { now: n, upcoming: u, past: p }
  }, [fundingRounds])

  const renderSection = (
    status: "now" | "upcoming" | "past",
    rounds: FundingRound[],
  ) => {
    return (
      <div className="flex flex-col gap-y-4">
        <div className="h-8">
          <h3 className="text-lg font-semibold">{titlecase(status)}</h3>
        </div>
        {rounds.map((fundingRound) => (
          <Round
            key={fundingRound.number}
            fundingRound={fundingRound}
            link={fundingRound.link}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-y-12 w-full", className)}>
      {now.length > 0 && renderSection("now", now)}
      {upcoming.length > 0 && renderSection("upcoming", upcoming)}
      {past.length > 0 && renderSection("past", past)}
    </div>
  )
}

const Round = ({
  className,
  fundingRound,
  link,
}: {
  className?: string
  fundingRound: FundingRound
  link?: string
}) => {
  const router = useRouter()
  const { setOpenDialog } = useAppDialogs()

  const onClick = () => {
    if (fundingRound.status === "now") {
      setOpenDialog("get_started")
      return
    }

    link && router.push(link)
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "flex gap-x-6 border rounded-3xl p-10",
        (link || fundingRound.status === "now") && "hover:shadow-md",
        className,
      )}
    >
      {fundingRound.status !== "past" && (
        <div
          className="flex items-center justify-center h-[124px] w-[124px] rounded-md shrink-0"
          style={{ backgroundColor: fundingRound.accentColor ?? "#F2F3F8" }}
        >
          {fundingRound.iconUrl && (
            <Image
              src={fundingRound.iconUrl}
              width={92}
              height={92}
              alt="h-[92px] w-[92px] object-center object-contain"
            />
          )}
        </div>
      )}

      <div className="flex flex-col gap-y-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-y-1">
            <h2 className="text-2xl font-semibold text-start">
              Round {fundingRound.number}
              {fundingRound.status !== "past" ? ": " + fundingRound.name : ""}
            </h2>

            <div className="flex items-center gap-x-1.5">
              <Badge
                text={titlecase(fundingRound.status)}
                accent={fundingRound.status === "now"}
              />
              <p className="text-muted-foreground">
                {fundingRound.status === "now" && fundingRound.endsAt ? (
                  <>Apply by {format(fundingRound.endsAt, "MMM d")}</>
                ) : (
                  <>{format(fundingRound.startsAt, "MMM yyyy")}</>
                )}
              </p>
            </div>
          </div>
        </div>

        {fundingRound.status === "past" ? (
          <div className="flex items-center gap-2 text-sm text-secondary-foreground">
            <ChainLogo chainId={optimism.id.toString()} />
            <div>
              <span className="font-medium">{fundingRound.funding?.op} OP</span>{" "}
              to{" "}
              <span className="font-medium">
                {fundingRound.funding?.projects} projects
              </span>
            </div>
          </div>
        ) : (
          <p className="text-secondary-foreground text-start">
            {fundingRound.details}
          </p>
        )}

        {fundingRound.status === "now" && (
          <div className="flex text-secondary-foreground text-sm font-medium">
            <div className="items-center flex gap-2 pr-4 border-r border-border">
              <ChainLogo chainId={optimism.id.toString()} />
              <div>10M OP</div>
            </div>
            <div className="flex gap-1 items-center pl-4">
              <div>Apply</div>
              <ArrowRight size={16} />
            </div>
          </div>
        )}
      </div>
    </button>
  )
}
