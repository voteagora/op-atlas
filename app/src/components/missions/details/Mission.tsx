"use client"

import { format } from "date-fns"
import Image from "next/image"
import { usePathname } from "next/navigation"
import React from "react"

import { Eligibility } from "@/components/missions/details/Eligibility"
import Header from "@/components/missions/details/Header"
import Rewards from "@/components/missions/details/Rewards"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import {
  FUNDING_ROUNDS,
  FundingRoundData,
  MissionData,
} from "@/lib/MissionsAndRoundData"

import ExternalLink from "../../ExternalLink"
import { RoundEnrolledProjectsCard } from "./RoundEnrolledProjectsCard"
import { UserRoundApplicationStatusCard } from "./UserRoundApplicationStatusCard"

export default function Mission() {
  const mission = useMissionFromPath()

  return (
    <div className="mt-20 bg-background flex flex-col w-full max-w-5xl rounded-3xl z-10">
      <div className="flex flex-1 gap-x-12">
        <div className="flex flex-1 flex-col items-center">
          <div className="flex flex-col gap-y-12 w-[686px]">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/missions">
                    Retro Funding Missions
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{mission?.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col">
              <Header />
              <Eligibility />
              <div className="mt-10">
                <Rewards />
              </div>

              <div className="mt-10">
                <p className="text-xl font-semibold">Requirements</p>
                {mission?.missionPageRequirements}
              </div>

              {mission?.footer}
            </div>
          </div>
        </div>

        {mission && new Date() > mission?.startsAt && (
          <div className="flex flex-col gap-y-6 ml-auto w-[290px] sticky top-40 h-full">
            <>
              <UserRoundApplicationStatusCard />
              <RoundEnrolledProjectsCard />
            </>
          </div>
        )}
      </div>
    </div>
  )
}
