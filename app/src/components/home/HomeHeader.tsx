"use client"
import localFont from "next/font/local"
import { useState } from "react"

import { NumberTicker } from "@/components/common/NumberTicker"
import { ArrowDownS, ArrowUpS } from "@/components/icons/remix"
import { cn } from "@/lib/utils"

import { SupportedChains } from "./SupportedChains"

const riformaFont = localFont({
  src: "./RiformaLLWeb-Regular.woff2",
})

const RenderStats = ({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) => {
  return (
    <div className="flex-1 py-0 md:py-6 inline-flex flex-col justify-start items-center overflow-hidden gap-2 md:gap-0">
      <div className="inline-flex justify-center items-center gap-2">
        <NumberTicker
          value={title}
          className="justify-start text-text-foreground text-2xl font-normal"
        />
      </div>
      <div className="inline-flex justify-center items-center gap-1.5">
        <div className="justify-start text-secondary-foreground text-xs md:text-base font-normal">
          {subtitle}
        </div>
      </div>
    </div>
  )
}

export const HomeHeader = () => {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
  }

  return (
    <div className="flex flex-col gap-12 text-center">
      <div className="inline-flex flex-col items-center gap-6">
        <div
          className={cn(
            "text-black font-normal text-[30px] leading-[38px] md:text-[56px] md:leading-[64px] tracking-[-1px]",
            riformaFont.className,
          )}
        >
          Grants for the <br />
          Superchain Ecosystem
        </div>
        <div className="text-secondary-foreground max-w-[712px] text-[18px] font-normal leading-normal">
          Support for individual builders and teams making onchain apps,
          tooling, and infrastructure to advance the Superchain.{" "}
          <span className={`${open ? "inline" : "hidden md:inline"}`}>
            Our grants are for different stages of development, from pre-launch
            to established projects looking to scale their impact.
          </span>
          <span
            className="inline md:hidden"
            onClick={() => handleOpenChange(!open)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleOpenChange(!open)
              }
            }}
          >
            {open ? (
              <ArrowUpS className="inline h-4 w-4" fill="#404454" />
            ) : (
              <ArrowDownS className="inline h-4 w-4" fill="#404454" />
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-col sm:gap-12 md:gap-6 ">
        <div className="inline-flex justify-start items-start gap-6">
          <RenderStats title="71M" subtitle="OP rewarded in Retro Funding" />
          <div className="w-px self-stretch bg-tertiary" />
          <RenderStats title="102M" subtitle="OP rewarded by Grants Council" />
          <div className="w-px self-stretch bg-tertiary" />
          <RenderStats title="728" subtitle="Projects rewarded" />
        </div>
        <div className="justify-center items-center h-auto md:h-[112px] mx-[-24px] md:mx-0">
          <SupportedChains />
        </div>
      </div>
    </div>
  )
}
