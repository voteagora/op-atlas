"use client"

import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas-lite"
import Image from "next/image"
import { useRef, useState } from "react"

import { useAnalytics } from "@/providers/AnalyticsProvider"

import { ArrowRightS } from "../icons/remix"
import { SunnyModal } from "./SunnyModal"

export const SunnyGuide = () => {
  const [open, setOpen] = useState(false)
  const sunnyRef = useRef<HTMLDivElement>(null)
  const { RiveComponent } = useRive({
    src: "/assets/images/sunny-animation.riv",
    autoplay: true,
    stateMachines: "State Machine 1",
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    automaticallyHandleEvents: true,
  })

  const { track } = useAnalytics()
  const handleSunnyDialogOpen = (open: boolean) => {
    track("Button Click", {
      text: "Sunny Guide",
      source: "home_page",
      button_type: "Dialog",
      category: "Sunny Guide",
      elementType: "Div: role=button",
      elementName: "Previous",
    })
    setOpen(open)
  }
  return (
    <>
      <div
        ref={sunnyRef}
        className="w-full md:h-[280px] h-[250px] px-10 pb-16 bg-[#fff0f1] rounded-xl inline-flex flex-col md:justify-center items-center gap-6 overflow-hidden hover:bg-[#FFD1D5] transition-colors cursor-pointer group relative"
        onClick={() => handleSunnyDialogOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleSunnyDialogOpen(true)
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open Sunny guide to help find the right grant program"
      >
        <RiveComponent className="w-full h-full hidden md:block" />
        <div className="md:hidden inline-flex flex-col text-center justify-center text-[#b80018] text-xl font-normal leading-7 group-hover:underline mt-6">
          <div className="">Not sure?</div>
          <div>Sunny can help you find the right grant program</div>
        </div>
        <Image
          src="/assets/images/sunny.svg"
          alt="Sunny"
          width={237}
          height={122}
          className="block md:hidden absolute bottom-[0px]"
        />

        <div className="hidden md:inline-flex justify-start items-center gap-2 absolute  bottom-[64px]">
          <div className="justify-center text-[#b80018] text-xl font-normal leading-7 group-hover:underline">
            Not sure? Sunny can help you find the right grant program
          </div>
          <ArrowRightS className="w-6 h-6" fill="#b80018" />
        </div>
      </div>
      <SunnyModal
        open={open}
        onOpenChange={(open) => {
          setOpen(open)
        }}
      />
    </>
  )
}
