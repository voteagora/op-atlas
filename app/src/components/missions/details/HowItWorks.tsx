"use client"

import { useRouter } from "next/navigation"
import { useLogin } from "@privy-io/react-auth"
import { useSession } from "next-auth/react"
import React, { useState } from "react"

import { CarouselPagination } from "@/components/ui/carousel-pagination"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import ExternalLink from "@/components/ExternalLink"
import { ArrowRightNew } from "@/components/icons/ArrowRightNew"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { cn } from "@/lib/utils"

export interface HowItWorksStep {
  number: number
  title: React.ReactNode
  description?: string
  subDetails?: string
  subDetailsLink?: string
  enforceSignIn?: boolean
}

export function HowItWorks() {
  const mission = useMissionFromPath()
  const steps = mission?.howItWorks || []
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(1)
  const { login: privyLogin } = useLogin()
  const { data } = useSession()

  const router = useRouter()

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

  const loginEnforced = (step: HowItWorksStep) => {
    if (!data) {
      privyLogin()
    } else {
      router.push(step.subDetailsLink || "#")
    }
  }

  if (steps.length === 0) return null

  // Calculate the appropriate basis value to show a partial view of the next card
  // when there are 4 or more cards
  const shouldShowPartialNextCard = steps.length >= 4
  const carouselOpts = {
    align: shouldShowPartialNextCard
      ? ("start" as const)
      : ("center" as const),
    containScroll: "trimSnaps" as const,
    dragFree: false,
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
                <div className="h-[100%] md:h-[350px] p-6 bg-[#F2F3F8] rounded-xl flex flex-col justify-between">
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
                      {step.enforceSignIn ? (
                        <button
                          type="button"
                          className="text-secondary-foreground text-sm inline-flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-none p-0 text-left"
                          onClick={() => loginEnforced(step)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              loginEnforced(step)
                            }
                          }}
                        >
                          {step.subDetails}
                          <ArrowRightNew className="fill-secondary-foreground h-3 w-3 pl-1" />
                        </button>
                      ) : (
                        <ExternalLink
                          href={step.subDetailsLink || "#"}
                          className="text-secondary-foreground text-sm inline-flex items-center gap-1 hover:underline"
                        >
                          {step.subDetails}
                          <ArrowRightNew className="fill-secondary-foreground h-3 w-3 pl-1" />
                        </ExternalLink>
                      )}
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Custom Navigation */}
        <CarouselPagination
          api={api}
          current={current}
          count={count}
          className={paginationClass}
        />
      </div>
    </div>
  )
}
