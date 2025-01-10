"use client"
import { format } from "date-fns"
import Image from "next/image"
import { FundingRound } from "@/lib/mocks"
import { Badge } from "../ui/badge"
import { Check } from "lucide-react"

export function FundingRoundOngoing({
  fundingRound,
  userApplicationState,
}: {
  fundingRound: FundingRound
  userApplicationState: "Open" | "Pending" | "Active"
}) {
  const openBadge = (
    <Badge
      className={`text-xs font-medium text-blue-800 border-0 ${"bg-calloutAlternative-foreground"}`}
      variant={"outline"}
    >
      {"Open"}
    </Badge>
  )

  const pendingBadge = (
    <Badge
      className={`text-xs font-medium text-blue-800 border-0 ${"bg-calloutAlternative-foreground"}`}
      variant={"outline"}
    >
      {"Pending"}
    </Badge>
  )

  const activeBadge = (
    <Badge
      className={`text-xs font-medium text-green-800 border-0 bg-green-100`}
      variant={"outline"}
    >
      <Check width={12} height={12}></Check>
      {"Active"}
    </Badge>
  )

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
    <>
      <div className="flex flex-col gap-y-4 justify-start">
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
          {fundingRound.details}
        </p>
      </div>
    </>
  )
}
