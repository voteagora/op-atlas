"use client"

import React, { useState } from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface FeaturedProject {
  name: string
  description: string
  imageUrl: string
  rewardAmount: string
  rewardIcon?: string
}

export function FeaturedProjects() {
  const mission = useMissionFromPath()
  const projects = mission?.featuredProjects || []
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

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
    <div className="w-full flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Featured projects</h2>
      <div className="w-full">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {projects.map((project, index) => (
              <CarouselItem key={index} className="basis-full">
                <div className="p-6 bg-background border border-border rounded-xl flex gap-6">
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-col gap-4">
                      <h3 className="text-xl font-semibold">{project.name}</h3>
                      <p className="text-secondary-foreground text-base max-w-[440px]">
                        {project.description}
                      </p>
                    </div>
                    <div className="px-3 py-1.5 bg-red-50 rounded-full border border-red-200 inline-flex items-center gap-1.5 w-fit">
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
                  <Image
                    src={project.imageUrl}
                    alt={project.name}
                    width={204}
                    height={204}
                    className="w-[204px] h-[204px] rounded-lg border border-border object-cover"
                  />
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
            onClick={() => api?.scrollPrev()}
            disabled={current === 1}
            className="px-4 py-2.5"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {Array.from({ length: count }).map((_, index) => (
            <Button
              key={index}
              variant={current === index + 1 ? "outline" : "ghost"}
              size="default"
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "w-10 px-4 py-2.5",
                current === index + 1 && "bg-background border-border"
              )}
            >
              {index + 1}
            </Button>
          ))}
          
          <Button
            variant="ghost"
            size="default"
            onClick={() => api?.scrollNext()}
            disabled={current === count}
            className="px-4 py-2.5"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}