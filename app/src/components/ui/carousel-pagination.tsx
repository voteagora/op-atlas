"use client"

import React from "react"
import { ArrowLeftSLine, ArrowRightSLine } from "@/components/icons/reminx"

import { Button } from "@/components/ui/button"
import { CarouselApi } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

export interface CarouselPaginationProps {
  api?: CarouselApi | null
  current: number
  count: number
  className?: string
  onPrev?: () => void
  onNext?: () => void
}

export function CarouselPagination({
  api,
  current,
  count,
  className,
  onPrev,
  onNext,
}: CarouselPaginationProps) {
  const handlePrev = () => {
    api?.scrollPrev()
    if (onPrev) onPrev()
  }

  const handleNext = () => {
    api?.scrollNext()
    if (onNext) onNext()
  }

  return (
    <div
      className={cn("flex justify-center items-center gap-2 mt-4", className)}
    >
      <Button
        variant="ghost"
        size="default"
        onClick={handlePrev}
        disabled={current === 1}
        className="px-3 py-2.5 hover:bg-[#F2F3F8]"
      >
        <ArrowLeftSLine className="w-4 h-4" fill="#0F111A" />
      </Button>

      <Button
        variant="ghost"
        size="default"
        onClick={handleNext}
        disabled={current === count}
        className="px-3 py-2.5 hover:bg-[#F2F3F8]"
      >
        <ArrowRightSLine className="w-4 h-4" fill="#0F111A" />
      </Button>
    </div>
  )
}
