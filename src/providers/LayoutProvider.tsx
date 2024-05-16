"use client"

import React from "react"
import { useWindowSize } from "usehooks-ts"

import { MobileViewportWarning } from "@/components/common/MobileViewportWarning"
import Navbar from "@/components/common/Navbar"

const MOBILE_BREAKPOINT = 640 // Tailwind's `sm` breakpoint

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { width } = useWindowSize()

  return (
    <div className="bg-background flex flex-col flex-1 min-h-screen w-full">
      <Navbar />
      {width < MOBILE_BREAKPOINT ? <MobileViewportWarning /> : children}
    </div>
  )
}
