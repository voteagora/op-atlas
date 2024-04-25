import { format } from "date-fns"
import { useMemo } from "react"
import Image from "next/image"
import { cn, titlecase } from "@/lib/utils"
import { FundingRound } from "@/lib/mocks"
import { Button } from "../ui/button"
import { Badge } from "../common/Badge"

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
  return (
    <div className={cn("flex gap-x-6 border rounded-3xl p-10", className)}>
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
            <h2 className="text-2xl font-semibold">
              Round {fundingRound.number}
              {fundingRound.status !== "past" ? ": " + fundingRound.name : ""}
            </h2>

            {fundingRound.status === "past" && fundingRound.endsAt ? (
              <p className="font-medium">
                Closed in {format(fundingRound.endsAt, "MMM yyyy")}
              </p>
            ) : null}

            {fundingRound.status !== "past" && (
              <div className="flex items-center gap-x-1.5">
                <Badge
                  text={titlecase(fundingRound.status)}
                  accent={fundingRound.status === "now"}
                />
                <p className="text-muted-foreground">
                  {fundingRound.status === "now" ? (
                    <>Apply by {format(fundingRound.startsAt, "MMM do")}</>
                  ) : (
                    <>{format(fundingRound.startsAt, "MMM yyyy")}</>
                  )}
                </p>
              </div>
            )}
          </div>

          {fundingRound.status === "past" && (
            <Button variant="outline">View</Button>
          )}
        </div>

        <p className="text-muted-foreground">{fundingRound.details}</p>
      </div>
    </div>
  )
}
