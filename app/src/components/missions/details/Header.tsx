"use client"

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
        {isOpenForEnrollment ? (
          <div className="px-4 py-2 bg-callout rounded-full inline-flex mb-12">
            <div className="text-info text-sm">Open</div>
          </div>
        ) : (
          <div className="px-4 py-2 bg-[#FFD1D5] rounded-full inline-flex mb-12">
            <div className="text-[#B80018] text-sm">Closed</div>
          </div>
        )}
        <h1 className="text-4xl mb-6 font-semibold text-text-default leading-[44px]">
          {missioName}
        </h1>
        <div className="flex gap-2">
          <div className="flex flex-col gap-6">
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
