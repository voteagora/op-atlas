"use client"
import { format } from "date-fns"
import Image from "next/image"
import { FundingRound } from "@/lib/mocks"
import { Badge } from "../ui/badge"
import { Check } from "lucide-react"
import { BlueBadge } from "../missions/badges/BlueBadge"
import { GreenBadge } from "../missions/badges/GreenBadge"

export function FundingRoundOngoing({
  fundingRound,
  userApplicationState,
}: {
  fundingRound: FundingRound
  userApplicationState: "Open" | "Pending" | "Active"
}) {
  const openBadge = <BlueBadge text="Open" />
  const pendingBadge = <BlueBadge text="Pending" />
  const activeBadge = <GreenBadge />

  let selectedBadge

  switch (userApplicationState) {
    case "Open":
      selectedBadge = openBadge
      break
    case "Pending":
      selectedBadge = pendingBadge
      break
    case "Active":
      selectedBadge = activeBadge
      break
    default:
      throw new Error("Unhandled application state")
  }

  return (
    <div className="flex flex-col gap-y-4 justify-start p-10">
      <div className="flex flex-col justify-between gap-y-1">
        <div className="flex justify-between space-x-2">
          <h2 className="text-base font-semibold text-text-default text-start">
            {fundingRound.name}
          </h2>
          {selectedBadge}
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
            className="rounded-md w-full"
            alt="Sunny blobs"
          />
        )}
      </div>
      <p className="text-secondary-foreground text-start line-clamp-3 text-sm">
        {"Retro Funding: " + fundingRound.name + " "}
        {fundingRound.details}
      </p>
    </div>
  )
}
