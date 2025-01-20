"use client"

import { format } from "date-fns"
import React from "react"
import Image from "next/image"
import { NewIn2025Callout } from "../common/callouts/NewIn2025Callout"
export default function Header({
  name,
  description,
  iconUrl,
  startsAt,
  endsAt,
}: {
  name: string
  description: string
  iconUrl?: string
  startsAt: Date
  endsAt: Date | undefined
}) {
  return (
    <>
      <h2 className="text-4xl mb-2">{name}</h2>
      <div className="flex gap-2 mb-6 items-center">
        <p className="font-light text-gray-700">
          <span>{format(startsAt, "MMM d")}</span>
          {endsAt && <span>{" - " + format(endsAt, "MMM d, yyyy")}</span>}
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
      {iconUrl && (
        <Image
          src={iconUrl}
          width={124}
          height={124}
          className="rounded-md w-full mb-5"
          alt="Sunny blobs"
        />
      )}

      <div className="mb-5">
        <span className="font-semibold ">{`Retro Funding: ${name}`}</span>{" "}
        <span className="">{description}</span>
      </div>

      <ul className="list-disc pl-6">
        <li>
          <span className="font-bold ">{"Timeline:"}</span>
          <span className="">{` The program will take place from `}</span>
          <span>{format(startsAt, "MMM d")}</span>
          {endsAt && <span>{" - " + format(endsAt, "MMM d, yyyy")}</span>}.
        </li>
        <li>
          <span className="font-semibold ">{"Application period:"}</span>
          <span className="">
            {
              " Applications are rolling, with new applications being reviewed at the end of each month. Apply by the monthly application deadline, and your project will be evaluated for rewards starting the following month."
            }
          </span>
        </li>
        <li>
          <span className="font-semibold ">{"Eligibility and rewards:"}</span>
          <span className="">{" See details below."}</span>
        </li>
        <li>
          <span className="font-semibold ">{"Grant delivery:"}</span>
          <span className="">
            {" Rewards are delivered monthly, starting in March."}
          </span>
        </li>
        <li>
          <span className="font-semibold ">{"Budget:"}</span>
          <span className="">{" Budget: Up to 8M OP"}</span>
        </li>
      </ul>

      <div className="mb-10">
        <NewIn2025Callout />
      </div>
    </>
  )
}
