"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import React, { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { useAnalytics } from "@/providers/AnalyticsProvider"

export interface FeaturedProject {
  name: string
  description: string
  imageUrl: string
  rewardAmount: string
  rewardIcon?: string
  href?: string
}

export function FeaturedProjects() {
  const mission = useMissionFromPath()
  const projects = mission?.featuredProjects || []
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const { track } = useAnalytics()
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

  if (projects.length === 0) return null

  return (
    <div className="w-full flex flex-col gap-6" style={{ maxWidth: "100vw" }}>
      <h2 className="text-xl font-semibold">Featured projects</h2>
      <div
        className=""
        style={{ maxWidth: "calc(100vw - 48px)", overflowX: "clip" }}
      >
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent className="">
            {projects.map((project, index) => (
              <CarouselItem key={index} className="basis-full">
                <div
                  className="flex flex-col-reverse sm:flex-row group p-6 bg-background border border-border rounded-xl flex gap-6 hover:bg-secondary hover:cursor-pointer h-full"
                  onClick={() => {
                    if (project.href) {
                      window.open(project.href, "_blank")
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      if (project.href) {
                        window.open(project.href, "_blank")
                      }
                    }
                  }}
                  aria-label={`View ${project.name} project`}
                  role="link"
                  tabIndex={0}
                >
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xl font-semibold group-hover:underline">
                        {project.name}
                      </h4>
                      <p className="text-secondary-foreground text-base max-w-[440px] line-clamp-4">
                        {project.description}
                      </p>
                    </div>
                    <div className="px-3 py-1.5 bg-red-50 rounded-full border border-red-200 inline-flex items-center gap-1.5 w-fit mt-12 mt-0">
                      {project.rewardIcon && (
                        <Image
                          src={project.rewardIcon}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span className="text-red-700 text-base font-medium">
                        {project.rewardAmount}
                      </span>
                    </div>
                  </div>
                  <div className="w-full sm:w-[204px] h-auto aspect-square">
                    <Image
                      src={project.imageUrl}
                      alt={project.name}
                      width={204}
                      height={204}
                      className="w-full h-full sm:w-[204px] sm:h-[204px] rounded-lg border border-border object-cover"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Custom Navigation */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="ghost"
            size="default"
            onClick={() => {
              api?.scrollPrev()
              track("Link Click", {
                text: projects[current - 1].name,
                type: "Featured Projects",
              })
            }}
            disabled={current === 1}
            className="px-4 py-2.5"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="default"
            onClick={() => {
              api?.scrollNext()
              track("Link Click", {
                text: projects[current - 1].name,
                type: "Featured Projects",
              })
            }}
            disabled={current === count}
            className="px-4 py-2.5"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}