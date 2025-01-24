"use client"

import { format } from "date-fns"
import Image from "next/image"
import { usePathname } from "next/navigation"
import React from "react"

import { VideoCallout } from "@/components/missions/common/callouts/VideoCallout"
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
import { useMissionFromPath } from "@/hooks/useMissionFromPath"
import { FUNDING_ROUNDS, FundingRound, ModernFundingRound } from "@/lib/mocks"

import ExternalLink from "../../ExternalLink"
import { RoundEnrolledProjectsCard } from "./RoundEnrolledProjectsCard"
import { UserRoundApplicationStatusCard } from "./UserRoundApplicationStatusCard"

export default function Mission() {
  const mission = useMissionFromPath()

  return (
    <div className="mt-16 bg-background flex flex-col px-16 w-full max-w-5xl rounded-3xl z-10">
      <div className="mt-1 flex flex-1 gap-x-10">
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col flex-1 gap-y-12">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">
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

        <div className="flex flex-col gap-y-6 ml-auto w-[290px]">
          <UserRoundApplicationStatusCard />
          <RoundEnrolledProjectsCard />
        </div>
      </div>
    </div>
  )
}
