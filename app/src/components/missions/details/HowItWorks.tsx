"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import React, { useState } from "react"

import ExternalLink from "@/components/ExternalLink"
import { ArrowDropRight } from "@/components/icons/ArrowDropRight"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { cn } from "@/lib/utils"
import { ArrowRightNew } from "@/components/icons/ArrowRightNew"

export interface HowItWorksStep {
  number: number
  title: React.ReactNode
  description?: string
  subDetails?: string
  subDetailsLink?: string
}

export function HowItWorks() {
  const mission = useMissionFromPath()
  const steps = mission?.howItWorks || []
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(1)
  // Directly use steps.length for count instead of relying on the carousel API
  const count = steps.length

  React.useEffect(() => {
    if (!api) {
      return
    }

    // Update current slide when carousel changes
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1)
    }
    // Initial update
    onSelect()
    // Subscribe to select events
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  if (steps.length === 0) return null
  const isMobile = window.innerWidth < 768

  // Calculate the appropriate basis value to show a partial view of the next card
  // when there are 4 or more cards
  const shouldShowPartialNextCard = steps.length >= 4
  const carouselOpts = {
    align: shouldShowPartialNextCard ? "start" as const : "center" as const,
    containScroll: "trimSnaps" as const,
    dragFree: false
  }

  const paginationClass = steps.length >= 4 ? "" : "flex md:hidden"
  
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">How it works</h2>
      <div
        className="w-full"
        style={{ maxWidth: "calc(100vw - 48px)", overflowX: "clip" }}
      >
        <Carousel setApi={setApi} opts={carouselOpts}>
          <CarouselContent className="-ml-3">
            {steps.map((step, index) => (
              <CarouselItem
                key={index}
                className={cn(
                  "pl-3",
                  shouldShowPartialNextCard
                    ? "basis-1/2 md:basis-[32%]"
                    : "basis-1/2 md:basis-1/3",
                )}
              >
                <div className="h-[350px] p-6 bg-secondary rounded-xl flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-callout-foreground text-4xl font-extrabold">
                      {step.number}
                    </h1>
                    <p className="text-base font-medium">{step.title}</p>
                    {step.description && (
                      <p className="text-secondary-foreground text-base">
                        {step.description}
                      </p>
                    )}
                  </div>
                  {step.subDetails && (
                    <div className="mt-auto pt-4">
                      <ExternalLink
                        href={step.subDetailsLink || "#"}
                        className="text-secondary-foreground text-sm inline-flex items-center gap-1 hover:underline"
                      >
                        {step.subDetails}
                        <ArrowRightNew className="fill-secondary-foreground h-3 w-3 pl-1" />
                      </ExternalLink>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Custom Navigation */}
        <div
          className={cn(
            "flex justify-center items-center gap-2 mt-4",
            paginationClass,
          )}
        >
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

          {steps.map((_, index) => {
            const isVisible = !isMobile || index < 2 || index === current - 1

            if (!isVisible) {
              if (index === 2) {
                return (
                  <span
                    key="ellipsis"
                    className="flex items-center px-2 align-self-center pb-[10px]"
                  >
                    ...
                  </span>
                )
              }
              return null
            }

            return (
              <Button
                key={index}
                variant={current === index + 1 ? "outline" : "ghost"}
                size="default"
                onClick={() => {
                  api?.scrollTo(index)
                  setCurrent(index + 1)
                }}
                className={cn(
                  "w-10 px-4 py-2.5",
                  current === index + 1 && "bg-background border-border",
                )}
                aria-current={current === index + 1 ? "page" : undefined}
              >
                {index + 1}
              </Button>
            )
          })}

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
