"use client"

import React, { useState } from "react"

import {
  ArrowRightS,
  BugLine,
  CodeFill,
  FundsLine,
  ShiningLine,
} from "@/components/icons/remix"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { CarouselPagination } from "@/components/ui/carousel-pagination"
import { useGitHubMissions } from "@/hooks/api/useGithubMissions"
import { MissionData, MISSIONS } from "@/lib/MissionsAndRoundData"
import { cn } from "@/lib/utils"
import { auditGrantsData } from "@/lib/utils/auditGrantsData"
import { foundationMissionsData } from "@/lib/utils/foundationMissions"
import { governanceFundMissionsData } from "@/lib/utils/governanceFundMissionsData"
import { growthGrantsData } from "@/lib/utils/growthGrantsData"
import { retroFundingDevToolingData } from "@/lib/utils/retroFundingDevToolingData"
import { retroFundingOnchainBuildersData } from "@/lib/utils/retroFundingOnchainBuildersData"

import TrackedLink from "../common/TrackedLink"

const missionsMap = {
  [retroFundingDevToolingData.pageName]: {
    icon: <ShiningLine fill="#0f111a" />,
    bestFor: "toolchain software",
  },
  [retroFundingOnchainBuildersData.pageName]: {
    icon: <ShiningLine fill="#0f111a" />,
    bestFor: "onchain apps",
  },
  [auditGrantsData.pageName]: {
    icon: <BugLine fill="#0f111a" />,
    bestFor: "pre-launch apps",
  },
  [growthGrantsData.pageName]: {
    icon: <FundsLine fill="#0f111a" />,
    bestFor: "established apps",
  },
  [foundationMissionsData.pageName]: {
    icon: <CodeFill fill="#0f111a" />,
    bestFor: "",
  },
  [governanceFundMissionsData.pageName]: {
    icon: <CodeFill fill="#0f111a" />,
    bestFor: "",
  },
}

export const GrantsInfo = () => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const { data } = useGitHubMissions()

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])
  const renderStatusPill = (mission: MissionData) => {
    let missionOpen =
      mission.startsAt < new Date() && mission.endsAt > new Date()
    if (mission.pageName === "foundation-missions" && data) {
      missionOpen = data?.AreMissionsOpen
    }

    let status = {
      text: missionOpen ? "Open" : "Closed",
      color: missionOpen ? "bg-callout" : "bg-secondary",
      textColor: missionOpen ? "text-info" : "text-secondary-foreground",
    }
    return (
      <div
        className={cn(status.color, "px-2.5 py-1 rounded-full items-center")}
      >
        <div
          className={cn(
            status.textColor,
            "text-center text-sm font-medium leading-[20px]",
          )}
        >
          {status.text}
        </div>
      </div>
    )
  }

  const renderMission = (mission: MissionData) => {
    return (
      <TrackedLink
        className="h-[344px] px-7 py-8 bg-foreground rounded-xl border border-tertiary inline-flex flex-col justify-between items-start text-secondary-foreground hover:bg-[#F2F3F8] cursor-pointer group"
        key={mission.name}
        href={`/missions/${mission.pageName}`}
        eventName="Link Click"
        eventData={{
          source: "home_page",
          linkName: mission.name,
          linkUrl: `/missions/${mission.pageName}`,
          category: "Grants",
        }}
      >
        <div className="flex flex-col items-start gap-6">
          <div className="self-stretch h-7 inline-flex justify-between items-center">
            <div className="w-7 h-7">{missionsMap[mission.pageName].icon}</div>
            {renderStatusPill(mission)}
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-text-default text-xl font-semibold leading-7 group-hover:underline">
              {mission.name === "Onchain Builders" ||
              mission.name === "Dev Tooling"
                ? `Retro Funding: ${mission.name}`
                : mission.name}
            </div>
            <div className=" text-base font-normal leading-normal">
              {mission.shortDescription}
            </div>
          </div>
          {/* <div className="self-stretch h-px border border-tertiary" />
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            {missionsMap[mission.pageName].bestFor && (
              <div className="inline-flex justify-start items-center gap-3">
                <UserFill className="w-[18px] h-[18px]" />
                <div className="text-center justify-start  text-sm font-normal leading-tight">
                  Best for {missionsMap[mission.pageName].bestFor}
                </div>
              </div>
            )}
            {mission.applyBy && (
              <div className="inline-flex justify-start items-center gap-3">
                <CalendarEventFill className="w-[18px] h-[18px]" />
                <div className="text-center justify-start  text-sm font-normal leading-tight">
                  {`Apply by ${format(mission.applyBy, "MMM d")}`}
                </div>
              </div>
            )}
            <div className="inline-flex justify-start items-center gap-3">
              <Image
                className="w-[18px] h-[18px] rounded-xl"
                src="/assets/icons/op-icon.svg"
                alt="OP"
                width={18}
                height={18}
              />
              <div className="text-center justify-start  text-sm font-normal leading-tight">
                Up to 55K each
              </div>
            </div>
          </div> */}
        </div>
        <div className="self-stretch inline-flex justify-end items-center gap-1.5">
          <div className="justify-start  text-sm font-normal leading-tight">
            Get started
          </div>
          <ArrowRightS className="w-4 h-4" />
        </div>
      </TrackedLink>
    )
  }

  return (
    <div className="w-full" style={{ maxWidth: "100vw" }}>
      {/* Mobile Carousel */}
      <div
        className="block md:hidden"
        style={{ maxWidth: "calc(100vw - 48px)", overflowX: "clip" }}
      >
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent className="">
            {MISSIONS.map((mission, index) => (
              <CarouselItem key={index} className="basis-full">
                {renderMission(mission)}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Custom Navigation */}
        <CarouselPagination
          api={api}
          current={current}
          count={count}
          showDots={true}
        />
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-3 gap-4 w-full">
        {MISSIONS.map((mission) => renderMission(mission))}
      </div>
    </div>
  )
}
