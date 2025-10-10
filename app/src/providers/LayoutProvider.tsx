"use client"

import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"
import { createContext, useContext, useRef } from "react"
import ReactCanvasConfetti from "react-canvas-confetti"
import { useWindowSize } from "usehooks-ts"

import { MobileViewportWarning } from "@/components/common/MobileViewportWarning"
import Navbar from "@/components/common/Navbar"

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

const brightColors = [
  "#FF0000",
  "#FFD700",
  "#00FF00",
  "#00BFFF",
  "#FF00FF",
  "#FF8C00",
  "#39FF14",
]

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { width } = useWindowSize()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  // Confetti logic
  const [showConfetti, setShowConfetti] = useState(false)
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

  if (!isMounted) {
    // Render nothing until the component is mounted on the client
    return null
  }

  // Don't show Navbar on KYC verification pages
  const hideNavbar = pathname.startsWith("/kyc")

  return (
    <ConfettiContext.Provider value={setShowConfetti}>
      <div className="bg-background flex flex-col flex-1 min-h-screen w-full">
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
  )
}
