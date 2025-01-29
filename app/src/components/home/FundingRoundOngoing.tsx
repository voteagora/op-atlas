"use client"
import { format } from "date-fns"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { FundingRoundData, MissionData } from "@/lib/MissionsAndRoundData"

import { BlueBadge } from "../missions/common/badges/BlueBadge"
import { GreenBadge } from "../missions/common/badges/GreenBadge"
import { GreyBadge } from "../missions/common/badges/GreyBadge"

export function FundingRoundOngoing({
  fundingRound,
  userApplicationState,
}: {
  fundingRound: MissionData
  userApplicationState: "Open" | "Active" | "Coming Soon"
}) {
  const router = useRouter()

  const openBadge = <BlueBadge text="Open" />
  const activeBadge = <GreenBadge />
  const comingSoonBadge = <GreyBadge text="Coming soon" />

  let selectedBadge

  switch (userApplicationState) {
    case "Open":
      selectedBadge = openBadge
      break

    case "Active":
      selectedBadge = activeBadge
      break
    case "Coming Soon":
      selectedBadge = comingSoonBadge
      break
    default:
      throw new Error("Unhandled application state")
  }

  return (
    <button
      onClick={() => {
        router.push(`/missions/${fundingRound.pageName}`)
      }}
    >
      <div className="flex flex-col gap-y-4 justify-start p-8">
        <div className="flex flex-col justify-between gap-y-1">
          <div>
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
                    {fundingRound.startsAt &&
                      format(fundingRound.startsAt, "MMM d")}{" "}
                    -{" " + format(fundingRound.endsAt, "MMMM d, yyyy")}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div>
            {fundingRound.iconUrl && (
              <Image
                src={fundingRound.iconUrl}
                width={124}
                height={124}
                className="rounded-md w-full mt-1"
                alt="Sunny blobs"
              />
            )}
          </div>
        </div>
        <p className="text-secondary-foreground text-start line-clamp-3 text-sm">
          {"Retro Funding: " + fundingRound.name + " "}
          {fundingRound.details}
        </p>
      </div>
    </button>
  )
}
