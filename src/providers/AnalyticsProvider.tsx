"use client"

import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import mixpanel from "mixpanel-browser"
import { useSession } from "next-auth/react"
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
} from "react"

import usePrevious from "@/lib/hooks"

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

if (!MIXPANEL_TOKEN) {
  console.warn("NEXT_PUBLIC_MIXPANEL_TOKEN missing from env")
}

const isServer = typeof window === "undefined"

if (!isServer) {
  mixpanel.init(MIXPANEL_TOKEN ?? "", {
    debug: true,
    track_pageview: true,
    persistence: "localStorage",
  })
}

type Analytics = {
  track: (event: string, data?: Record<string, unknown>) => void
}

const AnalyticsContext = createContext<Analytics>({} as Analytics)

export function useAnalytics() {
  const analytics = useContext(AnalyticsContext)
  if (!analytics) throw new Error("Must be inside an <AnalyticsProvider>")

  return analytics
}

export function AnalyticsProvider({ children }: PropsWithChildren) {
  const { data: session } = useSession()

  const farcasterId = session?.user?.farcasterId
  const previousUserId = usePrevious(session?.user?.farcasterId)

  const track = useCallback((event: string, data?: Record<string, unknown>) => {
    mixpanel.track(event, data)
  }, [])

  // Identify user when session changes
  useEffect(() => {
    if (farcasterId && !previousUserId) {
      mixpanel.identify(farcasterId)
    }
    if (!farcasterId && previousUserId) {
      mixpanel.reset()
    }
  }, [farcasterId, previousUserId])

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
      <Analytics />
      <SpeedInsights />
    </AnalyticsContext.Provider>
  )
}
