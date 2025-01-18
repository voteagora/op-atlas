"use client"

import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useWindowSize } from "usehooks-ts"

import { MobileViewportWarning } from "@/components/common/MobileViewportWarning"
import Navbar from "@/components/common/Navbar"

const MOBILE_BREAKPOINT = 640 // Tailwind's `sm` breakpoint

// Restricted routes that are not allowed on mobile
// TODO: Remove this once all routes are mobile-friendly
const RESTRICTED_MOBILE_ROUTES = [
  "/rounds",
  "/dashboard",
  "/profile",
  "/projects",
  "/application",
  "/rewards",
]

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { width } = useWindowSize()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Render nothing until the component is mounted on the client
    return null
  }

  return (
    <div className="bg-background flex flex-col flex-1 min-h-screen w-full">
      <Navbar />
      {width < MOBILE_BREAKPOINT &&
      RESTRICTED_MOBILE_ROUTES.includes(pathname) ? (
        <MobileViewportWarning />
      ) : (
        children
      )}
    </div>
  )
}
