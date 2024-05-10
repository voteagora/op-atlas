"use client"

import React from "react"

import { MobileViewportWarning } from "@/components/common/MobileViewportWarning"
import Navbar from "@/components/common/Navbar"
import { useWindowSize } from "@/lib/hooks"

const MOBILE_BREAKPOINT = 640 // Tailwind's `sm` breakpoint

const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const { width } = useWindowSize()

  return (
    <div className="bg-background flex flex-col flex-1 min-h-screen w-full">
      <Navbar />
      {width < MOBILE_BREAKPOINT ? <MobileViewportWarning /> : children}
    </div>
  )
}

export default LayoutProvider
