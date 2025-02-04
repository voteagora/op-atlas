"use client"

import { format } from "date-fns"
import Image from "next/image"
import React from "react"

import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"

import { NewIn2025Callout } from "../common/callouts/NewIn2025Callout"
export default function Header() {
  const mission = useMissionFromPath()

  const isOpenForEnrollment = mission && mission?.startsAt < new Date()

  return (
    <>
      <p className="text-4xl mb-2 font-semibold">{mission?.name}</p>
      <div className="flex gap-2 mb-6 items-center">
        <p className="text-secondary-foreground">
          <span>{format(mission!.startsAt, "MMM d")}</span>
          <span>{" - "}</span>
          {<span>{format(mission!.endsAt, "MMM d, yyyy")}</span>}
        </p>
        <div className="w-[1px] bg-gray-300 h-full"></div>

        {!isOpenForEnrollment && (
          <>
            <Image
              src={"/assets/icons/triangular-flag-muted-foreground.svg"}
              width={16}
              height={16}
              alt="Flag"
            />

            <p className="text-secondary-foreground">
              Not open for enrollment-coming soon
            </p>
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

            <p className="text-secondary-foreground">Open for applications</p>
          </>
        )}
      </div>
      {mission?.iconUrl && (
        <Image
          src={mission.iconUrl}
          width={1080}
          height={1080}
          className="rounded-xl w-full mb-5"
          alt="Sunny blobs"
        />
      )}

      <div className="mb-5">
        <span className="font-semibold">{`Retro Funding: ${mission?.name}`}</span>{" "}
        <span className="text-secondary-foreground">{mission?.details}</span>
      </div>

      <ul className="list-disc pl-6">
        <li>
          <span className="font-semibold">{"Timeline:"}</span>
          <span className="text-secondary-foreground">{` The program will take place from `}</span>
          <span className="text-secondary-foreground">
            {format(mission!.startsAt, "MMM d")}
          </span>
          <span className="text-secondary-foreground">{" - "}</span>
          {
            <span className="text-secondary-foreground">
              {format(mission!.endsAt, "MMM d, yyyy")}
            </span>
          }
          .
        </li>
        <li>
          <span className="font-semibold">{"Application periods:"}</span>
          <span className="text-secondary-foreground">
            {
              " Apply by the monthly application deadline, and your project will be evaluated for rewards starting the following month."
            }
          </span>
        </li>
        <li>
          <span className="font-semibold">{"Grant delivery:"}</span>
          <span className="text-secondary-foreground">
            {" Rewards are delivered monthly, starting in March."}
          </span>
        </li>
        <li>
          <span className="font-semibold">{"Budget:"}</span>
          <span className="text-secondary-foreground">{" Up to 8M OP"}</span>
        </li>
      </ul>

      <div className="mb-10">
        <NewIn2025Callout />
      </div>
    </>
  )
}
