"use client"

import React, { useState } from "react"

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

export interface HowItWorksStep {
  number: number
  title: React.ReactNode
  description?: string
}

export function HowItWorks() {
  const mission = useMissionFromPath()
  const steps = mission?.howItWorks || []
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

  if (steps.length === 0) return null

  return (
    <div className="w-full flex flex-col gap-6">
      <h2 className="text-xl font-semibold">How it works</h2>
      <div className="w-full">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent className="-ml-3">
            {steps.map((step, index) => (
              <CarouselItem key={index} className="pl-3 md:basis-1/3">
                <div className="h-[350px] p-6 bg-secondary rounded-xl flex flex-col gap-4">
                  <div className="text-primary text-4xl font-extrabold">
                    {step.number}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-base font-medium">
                      {step.title}
                    </div>
                    {step.description && (
                      <div className="text-secondary-foreground text-base">
                        {step.description}
                      </div>
                    )}
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