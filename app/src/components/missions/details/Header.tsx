"use client"

import { format } from "date-fns"
import Image from "next/image"
import React from "react"

import { useMissionFromPath } from "@/hooks/useMissionFromPath"

import { NewIn2025Callout } from "../common/callouts/NewIn2025Callout"
export default function Header() {
  //{
  //   name,
  //   description,
  //   iconUrl,
  //   startsAt,
  //   endsAt,
  // }: {
  //   name: string
  //   description: string
  //   iconUrl?: string
  //   startsAt: Date | undefined
  //   endsAt: Date | undefined
  // }
  const mission = useMissionFromPath()

  return (
    <>
      <h2 className="text-4xl mb-2">{mission?.name}</h2>
      <div className="flex gap-2 mb-6 items-center">
        <p className="font-light text-gray-700">
          <span>{format(mission!.startsAt, "MMM d")}</span>
          <span>{" - "}</span>
          {<span>{format(mission!.endsAt, "MMM d, yyyy")}</span>}
        </p>
        <div className="w-[1px] bg-gray-300 h-full"></div>
        <Image
          src={"/assets/icons/triangular-flag-full.png"}
          width={1}
          height={1}
          alt="Sunny blobs"
          className="h-3 w-3"
        />

        <p className="font-light text-gray-700">Open for applications</p>
      </div>
      {mission?.iconUrl && (
        <Image
          src={mission.iconUrl}
          width={124}
          height={124}
          className="rounded-md w-full mb-5"
          alt="Sunny blobs"
        />
      )}

      <div className="mb-5">
        <span className="font-semibold ">{`Retro Funding: ${mission?.name}`}</span>{" "}
        <span className="">{mission?.details}</span>
      </div>

      <ul className="list-disc pl-6">
        <li>
          <span className="font-bold ">{"Timeline:"}</span>
          <span className="">{` The program will take place from `}</span>
          <span>{format(mission!.startsAt, "MMM d")}</span>
          <span>{" - "}</span>
          {<span>{format(mission!.endsAt, "MMM d, yyyy")}</span>}.
        </li>
        <li>
          <span className="font-semibold ">{"Application periods:"}</span>
          <span className="">
            {
              " Apply by the monthly application deadline, and your project will be evaluated for rewards starting the following month."
            }
          </span>
        </li>
        <li>
          <span className="font-semibold ">{"Grant delivery:"}</span>
          <span className="">
            {" Rewards are delivered monthly, starting in March."}
          </span>
        </li>
        <li>
          <span className="font-semibold ">{"Budget:"}</span>
          <span className="">{" Up to 8M OP"}</span>
        </li>
      </ul>

      <div className="mb-10">
        <NewIn2025Callout />
      </div>
    </>
  )
}
