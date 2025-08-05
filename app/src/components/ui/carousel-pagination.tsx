"use client"

import React from "react"
import { ArrowLeftS, ArrowRightS } from "@/components/icons/remix"

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
  showDots?: boolean
}

export function CarouselPagination({
  api,
  current,
  count,
  className,
  onPrev,
  onNext,
  showDots,
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
        <ArrowLeftS className="w-4 h-4" fill="#0F111A" />
      </Button>
      {showDots && (
        <div className="flex items-center" style={{ gap: "8px" }}>
          {Array.from({ length: count }, (_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                current === index + 1 ? "bg-[#0F111A]" : "bg-border"
              }`}
            />
          ))}
        </div>
      )}
      <Button
        variant="ghost"
        size="default"
        onClick={handleNext}
        disabled={current === count}
        className="px-3 py-2.5 hover:bg-[#F2F3F8]"
      >
        <ArrowRightS className="w-4 h-4" fill="#0F111A" />
      </Button>
    </div>
  )
}
