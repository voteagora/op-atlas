"use client"

import { format } from "date-fns"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useMemo } from "react"
import { optimism } from "viem/chains"

import { FundingRound } from "@/lib/mocks"
import { cn, titlecase } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import { Badge } from "../common/Badge"
import { ChainLogo } from "../common/ChainLogo"
import ExternalLink from "../ExternalLink"

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
          <Round key={fundingRound.number} fundingRound={fundingRound} />
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
}: {
  className?: string
  fundingRound: FundingRound
}) => {
  const router = useRouter()
  const { status } = useSession()
  const { setOpenDialog } = useAppDialogs()

  const onClick = () => {
    if (fundingRound.status === "now") {
      if (status === "authenticated") {
        router.push("/dashboard")
      } else {
        setOpenDialog("get_started")
      }
      return
    }

    fundingRound.link && router.push(fundingRound.link)
  }

  if (fundingRound.status === "now") {
    return (
      <button
        onClick={onClick}
        type="button"
        className={cn(
          "flex gap-x-6 border rounded-3xl p-10 transition-all",
          (fundingRound.link || fundingRound.status === "now") &&
            "hover:shadow-md",
          className,
        )}
      >
        <FundingRoundContent fundingRound={fundingRound} />
      </button>
    )
  }

  if (!fundingRound.link) {
    return (
      <div className={cn("flex gap-x-6 border rounded-3xl p-10", className)}>
        <FundingRoundContent fundingRound={fundingRound} />
      </div>
    )
  }

  return (
    <ExternalLink
      href={fundingRound.link}
      className={cn("flex gap-x-6 border rounded-3xl p-10", className)}
    >
      <FundingRoundContent fundingRound={fundingRound} />
    </ExternalLink>
  )
}

function FundingRoundContent({ fundingRound }: { fundingRound: FundingRound }) {
  return (
    <>
      {fundingRound.status !== "past" && fundingRound.iconUrl && (
        <Image
          src={fundingRound.iconUrl}
          width={124}
          height={124}
          className="rounded-md"
          alt="Sunny blobs"
        />
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
            {fundingRound.funding?.op && (
              <ChainLogo chainId={optimism.id.toString()} />
            )}
            <div>
              {fundingRound.funding?.op && (
                <span className="font-medium">
                  {fundingRound.funding.op} OP
                </span>
              )}{" "}
              {fundingRound.funding?.dollar && (
                <span className="font-medium">
                  {fundingRound.funding.dollar}
                </span>
              )}{" "}
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
    </>
  )
}
