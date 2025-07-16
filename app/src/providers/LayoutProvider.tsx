"use client"

import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useWindowSize } from "usehooks-ts"

import { MobileViewportWarning } from "@/components/common/MobileViewportWarning"
import Navbar from "@/components/common/Navbar"
import { ArrowRight } from "@/components/icons/remix"
import Link from "next/link"

const MOBILE_BREAKPOINT = 640 // Tailwind's `sm` breakpoint

// Restricted routes that are not allowed on mobile
// TODO: Remove this once all routes are mobile-friendly
const RESTRICTED_MOBILE_ROUTES = [
  "/rounds",
  "/missions",
  "/dashboard",
  "/profile",
  "/projects",
  "/application",
  "/rewards",
  "/round/results",
  "/projects/*",
]

const isRestrictedRoute = (pathname: string) => {
  return RESTRICTED_MOBILE_ROUTES.some((route) => {
    if (route.endsWith("/*")) {
      const baseRoute = route.slice(0, -2)
      return pathname.startsWith(baseRoute)
    }
    return pathname === route
  })
}

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
      {width < MOBILE_BREAKPOINT && isRestrictedRoute(pathname) ? (
        <MobileViewportWarning />
      ) : (
        children
      )}
    </div>
  )
}
