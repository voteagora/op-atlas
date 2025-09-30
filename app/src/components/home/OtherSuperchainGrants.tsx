"use client"

import React, { useState } from "react"

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { CarouselPagination } from "@/components/ui/carousel-pagination"
import { superchainGrantsData } from "@/lib/utils/otherSuperchainGrantsData"

import { SuperchainGrantCard } from "./SuperchainGrantCard"

export const OtherSuperchainGrants = () => {
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

  return (
    <div className="w-full flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col gap-6 items-center text-center">
        <h2 className="text-5xl font-normal leading-none text-text-default tracking-[-0.96px]">
          Other Superchain Grants
        </h2>
        <p className="text-base font-normal leading-6 text-secondary-foreground max-w-[712px]">
          Explore grant programs facilitated by our Superchain partners
        </p>
      </div>

      {/* Mobile Carousel */}
      <div className="block md:hidden w-full">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {superchainGrantsData.map((grant) => (
              <CarouselItem key={grant.id} className="basis-full">
                <SuperchainGrantCard grant={grant} />
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
      <div className="hidden md:block w-full bg-background pb-20">
        <div className="grid grid-cols-3 gap-4 w-full">
          {superchainGrantsData.map((grant) => (
            <SuperchainGrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      </div>
    </div>
  )
}