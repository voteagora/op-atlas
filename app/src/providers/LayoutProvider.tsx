"use client"

import { usePathname } from "next/navigation"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { createContext, useContext, useRef } from "react"
import ReactCanvasConfetti from "react-canvas-confetti"
import { useWindowSize } from "usehooks-ts"

import { MobileViewportWarning } from "@/components/common/MobileViewportWarning"
import Navbar from "@/components/common/Navbar"
import { SeasonNineBannerClient } from "@/app/citizenship/components/s9/SeasonNineBannerClient"

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

export const ConfettiContext = createContext<null | ((show: boolean) => void)>(null)
export function useConfetti() {
  const ctx = useContext(ConfettiContext)
  if (!ctx) throw new Error("useConfetti must be used within ConfettiContext")
  return ctx
}

type TopBannerContextValue = {
  registerTopBanner: (id: string, banner: React.ReactNode | null) => void
  unregisterTopBanner: (id: string) => void
}

const TopBannerContext = createContext<TopBannerContextValue | null>(null)

export function useTopBanner() {
  const ctx = useContext(TopBannerContext)
  if (!ctx) throw new Error("useTopBanner must be used within LayoutProvider")
  return ctx
}

const brightColors = [
  "#FF0000",
  "#FFD700",
  "#00FF00",
  "#00BFFF",
  "#FF00FF",
  "#FF8C00",
  "#39FF14",
]

export const LayoutWrapper = ({
  children,
  defaultBanner,
}: {
  children: React.ReactNode
  defaultBanner?: { priorityWindow: boolean; registrationOpen: boolean; seasonName: string } | null
}) => {
  const { width } = useWindowSize()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  // Confetti logic
  const [showConfetti, setShowConfetti] = useState(false)
  const [banners, setBanners] = useState<Map<string, React.ReactNode>>(new Map())
  const confettiRef = useRef<any>(null)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    if (
      showConfetti &&
      confettiRef.current &&
      typeof confettiRef.current.confetti === "function"
    ) {
      const segments = 20
      for (let i = 0; i < segments; i++) {
        const x = i / (segments - 1)
        confettiRef.current.confetti({
          particleCount: 90,
          angle: 90,
          spread: 200,
          startVelocity: 60,
          gravity: 0.35,
          ticks: 500,
          origin: { x, y: 0 },
          colors: brightColors,
        })
      }
      timeoutId = setTimeout(() => setShowConfetti(false), 8000)
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [showConfetti])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const registerTopBanner = useCallback((id: string, banner: React.ReactNode | null) => {
    setBanners((prev) => {
      const next = new Map(prev)
      if (banner) {
        next.set(id, banner)
      } else {
        next.delete(id)
      }
      return next
    })
  }, [])

  const unregisterTopBanner = useCallback((id: string) => {
    setBanners((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const topBanner = useMemo(() => {
    if (banners.size === 0) return null
    const values = Array.from(banners.values())
    return values[values.length - 1] ?? null
  }, [banners])

  if (!isMounted) {
    // Render nothing until the component is mounted on the client
    return null
  }

  // Don't show Navbar on KYC verification pages
  const hideNavbar = pathname.startsWith("/kyc")

  return (
    <TopBannerContext.Provider
      value={{ registerTopBanner, unregisterTopBanner }}
    >
      <ConfettiContext.Provider value={setShowConfetti}>
        <div className="bg-background flex flex-col flex-1 min-h-screen w-full">
          {!hideNavbar && topBanner}
          {!hideNavbar && defaultBanner ? (
            <SeasonNineBannerClient
              priorityWindow={defaultBanner.priorityWindow}
              registrationOpen={defaultBanner.registrationOpen}
              seasonName={defaultBanner.seasonName}
            />
          ) : null}
          {!hideNavbar && <Navbar />}
          <ReactCanvasConfetti
            style={{
              position: "fixed",
              pointerEvents: "none",
              width: "100vw",
              height: "100vh",
              top: 0,
              left: 0,
              zIndex: 10001,
            }}
            className="confetti-canvas"
            onInit={(instance) => {
              confettiRef.current = instance
            }}
          />
          {width < MOBILE_BREAKPOINT && isRestrictedRoute(pathname) ? (
            <MobileViewportWarning />
          ) : (
            children
          )}
        </div>
      </ConfettiContext.Provider>
    </TopBannerContext.Provider>
  )
}
