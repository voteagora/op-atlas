"use client"

import { useUser } from "@privy-io/react-auth"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import mixpanel from "mixpanel-browser"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react"

import { usePrevious } from "@/lib/hooks"

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
    ignore_dnt: true,
    // @ts-expect-error autocapture is not typed
    autocapture: {
      pageview: "full-url",
      click: true,
      input: true,
      scroll: true,
      submit: true,
      capture_text_content: false,
    },
  })
}

type Analytics = {
  track: (event: string, data?: Record<string, unknown>) => void
  generateEventData: (
    extra?: Record<string, unknown>,
  ) => Record<string, unknown>
}

type BaseEventProps = {
  userId?: string
  privyId?: string
  geolocation?: string
  referringDomain?: string
  utmDetails?: string
}

const AnalyticsContext = createContext<Analytics>({} as Analytics)

export function useAnalytics() {
  const analytics = useContext(AnalyticsContext)
  if (!analytics) throw new Error("Must be inside an <AnalyticsProvider>")

  return analytics
}

function computeBaseProps(args: {
  pathname: string | null
  user: { id?: string | null; privyId?: string | null } | null
}) {
  if (isServer) return {}
  const { pathname, user } = args

  // Get URL parameters for tracking
  const url =
    typeof window !== "undefined" ? new URL(window.location.href) : null
  const referrer = typeof document !== "undefined" ? document.referrer : ""
  const referringDomain = referrer ? new URL(referrer).hostname : undefined

  // Assume UTM details are already provided as a single string
  const utmDetails = url?.searchParams.get("utm") || undefined

  return {
    userId: user?.id ?? undefined,
    privyId: user?.privyId ?? undefined,
    geolocation: undefined, // Will be populated if we add geolocation tracking
    referringDomain,
    utmDetails,
  }
}

export function AnalyticsProvider({ children }: PropsWithChildren) {
  const { data: session } = useSession()

  const farcasterId = session?.user?.farcasterId
  const previousUserId = usePrevious(session?.user?.farcasterId)
  const pathname = usePathname()
  const privyUser = useUser()

  const basePropsRef = useRef<BaseEventProps>({})

  useEffect(() => {
    basePropsRef.current = computeBaseProps({
      pathname,
      user: {
        id: session?.user?.id ?? null,
        privyId: privyUser.user?.id ?? null,
      },
    })
  }, [pathname, session?.user, privyUser.user])

  const generateEventData = useCallback(
    (extra?: Record<string, unknown>) => ({
      ...basePropsRef.current,
      ...(extra ?? {}),
    }),
    [],
  )

  const track = useCallback(
    (event: string, data?: Record<string, unknown>) => {
      const payload = generateEventData(data)
      mixpanel.track(event, payload)
    },
    [generateEventData],
  )

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
    <AnalyticsContext.Provider value={{ track, generateEventData }}>
      {children}
      <Analytics />
      <SpeedInsights />
    </AnalyticsContext.Provider>
  )
}
