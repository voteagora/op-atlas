"use client"

import Image from "next/image"
import React, { useState } from "react"

import { ArrowRightS } from "@/components/icons/remix"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { CarouselPagination } from "@/components/ui/carousel-pagination"
import { ProjectWithReward } from "@/lib/types"
import { formatNumber } from "@/lib/utils"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import TrackedLink from "../common/TrackedLink"

export const revalidate = 60 // 1 minute

export const RewardedProjectCrousel = ({
  projects,
}: {
  projects: ProjectWithReward[]
}) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const { track } = useAnalytics()

  React.useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const renderProject = (project: ProjectWithReward, index: number) => {
    const totalReward = project.rewards.reduce(
      (acc, reward) => acc + Number(reward.amount),
      0,
    )
    return (
      <CarouselItem
        key={`${project.name}-${index}`}
        className="basis-full md:basis-1/2 lg:basis-1/5"
      >
        <TrackedLink
          className="flex flex-col p-6 bg-foreground border border-tertiary rounded-xl h-full hover:bg-[#F2F3F8] cursor-pointer group"
          href={`/project/${project.id}`}
          eventName="Link Click"
          eventData={{
            source: "home_page",
            linkName: project.name,
            linkUrl: `/project/${project.id}`,
            category: "Rewarded Projects",
          }}
        >
          <div className="flex flex-col h-full">
            {/* Top content */}
            <div className="flex flex-col items-center gap-4 flex-1">
              <Image
                className="w-full h-full md:w-[100px] md:h-[100px] rounded-lg border border-tertiary"
                src={project.thumbnailUrl || ""}
                alt={project.name}
                width={100}
                height={100}
              />
              <div className="text-center text-base font-medium leading-normal text-secondary-foreground group-hover:underline line-clamp-2">
                {project.name}
              </div>
            </div>
            {/* Bottom-aligned badge */}
            <div className="md:mt-auto flex justify-center w-full mt-4">
              <div className="px-3 py-1.5 bg-[#fff0f1] rounded-full border border-[#ffd1d5] inline-flex gap-1.5 md:mt-4">
                <Image
                  className="w-[18px] h-[18px] rounded-[144px]"
                  src={"/assets/icons/op-icon.svg"}
                  alt={project.name}
                  width={18}
                  height={18}
                />
                <div className="text-center text-[#b80018] text-sm font-medium leading-tight">
                  {formatNumber(totalReward, 0, "compact")}
                </div>
              </div>
            </div>
          </div>
        </TrackedLink>
      </CarouselItem>
    )
  }

  return (
    <div className="inline-flex flex-col justify-start items-center gap-6 text-foreground">
      <div className="self-stretch inline-flex justify-between">
        <div className="justify-start text-xl font-semibold leading-7">
          Over 500 projects have been rewarded
        </div>
        <TrackedLink
          href="/round/results?rounds=7,8"
          eventName="Link Click"
          eventData={{
            source: "home_page",
            linkName: "See all",
            linkUrl: "/round/results?rounds=7,8",
            category: "Rewarded Projects",
          }}
          className="hidden md:flex px-4 py-2.5 rounded-md border border-tertiary flex justify-center items-center gap-2 hover:underline hover:bg-[#F2F3F8]"
        >
          <div className="justify-start text-sm font-medium leading-tight">
            See all
          </div>
          <ArrowRightS className="w-4 h-4" />
        </TrackedLink>
      </div>
      <div className="w-full" style={{ maxWidth: "100vw", overflowX: "clip" }}>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {projects.map((project: ProjectWithReward, index: number) =>
              renderProject(project, index),
            )}
          </CarouselContent>
        </Carousel>
        {/* Carousel Pagination */}
        <CarouselPagination
          api={api}
          current={current}
          count={count}
          onPrev={() => {
            track &&
              track("Button Click", {
                button_type: "Navigation",
                source: "home_page",
                text: "Previous",
                category: "Rewarded Projects",
              })
          }}
          onNext={() => {
            track &&
              track("Button Click", {
                button_type: "Navigation",
                source: "home_page",
                text: "Next",
                category: "Rewarded Projects",
              })
          }}
        />
      </div>
    </div>
  )
}
