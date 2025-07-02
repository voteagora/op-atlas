"use client"

import { format } from "date-fns"
import Image from "next/image"
import React from "react"

import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"

export default function Header() {
  const mission = useMissionFromPath()

  const isOpenForEnrollment = mission && mission?.startsAt < new Date()
  let missioName = mission?.name;

  if (mission?.pageName === "retro-funding-onchain-builders" || mission?.pageName === "retro-funding-dev-tooling") {
    missioName = `Retro Funding: ${mission.name}`;
  }

  return (
    <>
      <div>
        <h1 className="text-4xl mb-2 font-semibold text-text-default leading-[44px]">
          {missioName}
        </h1>
        {!mission?.disableDates && (
          <div className="flex gap-2 items-center">
            {!isOpenForEnrollment && (
              <>
                <Image
                  src={"/assets/icons/triangular-flag-muted-foreground.svg"}
                  width={16}
                  height={16}
                  alt="Flag"
                />

                <p className="text-secondary-foreground">Not open</p>
              </>
            )}

            {isOpenForEnrollment && (
              <>
                <Image
                  src={"/assets/icons/triangular-flag-full.svg"}
                  width={20}
                  height={20}
                  alt="Flag"
                />

                <p className="text-secondary-foreground">Open</p>
              </>
            )}
            <div className="w-[1px] h-6 bg-gray-300"></div>

            <p className="text-secondary-foreground">
              Season {mission?.season},{" "}
              <span>{format(mission!.startsAt, "MMM d")}</span>
              <span>{" - "}</span>
              {<span>{format(mission!.endsAt, "MMM d, yyyy")}</span>}
            </p>
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex flex-col gap-6">
            <div className="h-[1px] bg-gray-300 w-full mt-6" />

            {mission?.details.map((detail, index) => (
              <div className="" key={index}>
                <p className="text-secondary-foreground">{detail}</p>
              </div>
            ))}
            {mission?.subDetails && mission?.subDetails}
            {mission?.callout && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {mission.callout.map((callout, index) => (
                  <div key={index} className="flex">
                    {callout}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
