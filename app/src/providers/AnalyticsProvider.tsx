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
    record_sessions_percent: 1,
    record_heatmap_data: true,
  })
}

/**
 * EventTriggerInfo defines the required context information for analytics tracking.
 * These properties MUST be provided by the developer when calling track().
 *
 * IMPORTANT: All track() calls must include at least the elementType parameter to provide
 * context about what triggered the event (button click, link click, form submission, etc.).
 *
 * Required properties:
 * - elementType: Always required to identify what type of UI element triggered the event
 * - elementName: Required in most cases to provide context about the specific element
 *
 * Contextual properties (include when relevant):
 * - url: For navigation events or when linking to external resources
 * - projectId: When the event relates to a specific project
 * - organizationId: When the event relates to a specific organization
 * - elementId: When the element has a specific ID that provides additional context
 *
 * Examples:
 * - Button click: { elementType: "button", elementName: "Submit Application", projectId: "123" }
 * - Link click: { elementType: "link", elementName: "View Details", url: "/projects/123" }
 * - Form submission: { elementType: "form", elementName: "Project Application", projectId: "123" }
 */
type EventTriggerInfo = {
  /** Type of UI element that triggered the event (REQUIRED) */
  elementType: string // 'button', 'link', 'form', etc.
  /** Name or text of the element (REQUIRED) */
  elementName: string // name of the button, link, etc.
  /** ID of the element if available (optional) */
  elementId?: string // id of the element if available
  /** URL for navigation events (include for links) */
  url?: string // url for links
  /** Project ID when event relates to a specific project */
  projectId?: string // project id if relevant
  /** Organization ID when event relates to a specific organization */
  organizationId?: string // organization id if relevant
}

/**
 * Analytics interface defining the methods available for tracking events.
 *
 * An event represents a specific user action or system occurrence that should be tracked.
 * Events should be named using snake_case and be descriptive of the action (e.g., "button_clicked",
 * "form_submitted", "page_viewed").
 */
type Analytics = {
  /**
   * Track a user action or system event.
   *
   * @param event - The name of the event (e.g., "button_clicked", "form_submitted")
   * @param data - Additional data to include with the event, must include EventTriggerInfo properties
   */
  track: (
    event: string,
    data?: Record<string, unknown> & EventTriggerInfo,
  ) => void

  /**
   * Generate event data by combining base properties with additional data.
   *
   * @param extra - Additional properties to include in the event data
   * @returns Combined event data with base properties and extra properties
   */
  generateEventData: (
    extra?: Record<string, unknown>,
  ) => Record<string, unknown>
}

/**
 * BaseEventProps defines the properties that are automatically collected and included with every tracked event.
 * These properties are managed by the AnalyticsProvider and do not need to be manually specified when calling track().
 */
type BaseEventProps = {
  /** User ID from the application's authentication system */
  userId?: string
  /** User ID from Privy authentication if available */
  privyId?: string
  /** User's geographic location (when available and enabled) */
  geolocation?: string
  /** Domain that referred the user to the current page */
  referringDomain?: string
  /** UTM campaign parameters from the URL */
  utmDetails?: string
}

/**
 * Analytics Context for tracking user actions and events throughout the application.
 * This context provides access to tracking functions that integrate with Mixpanel.
 */
const AnalyticsContext = createContext<Analytics>({} as Analytics)

/**
 * Hook to access the analytics tracking functionality.
 *
 * @returns The analytics object with tracking methods
 * @throws Error if used outside of an AnalyticsProvider
 *
 * @example
 * ```tsx
 * const { track } = useAnalytics();
 *
 * // Track a button click
 * const handleClick = () => {
 *   track("button_clicked", {
 *     elementType: "button",
 *     elementName: "Submit Application",
 *     projectId: project.id
 *   });
 * };
 * ```
 */
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

/**
 * AnalyticsProvider is responsible for tracking user actions and events throughout the application.
 *
 * This provider:
 * 1. Automatically collects base properties (user IDs, referrer, UTM parameters)
 * 2. Provides the track() method to log events to Mixpanel
 * 3. Manages user identification for analytics
 *
 * Usage:
 * - Wrap your application with this provider
 * - Use the useAnalytics() hook in components to access tracking functionality
 *
 * Adding custom data to events:
 * When calling track(), you can include any additional custom properties beyond the required EventTriggerInfo:
 *
 * ```tsx
 * track("project proposal submitted", {
 *   // Required EventTriggerInfo properties
 *   elementType: "button",
 *   elementName: "Submit",
 *
 *   // Custom properties specific to this event
 *   proposalId: "proposal-123",
 *   citizenType: "user",
 *   projectId: "123abc",
 * });
 * ```
 *
 * Best practices for custom properties:
 * - Use consistent naming conventions (camelCase recommended)
 * - Include all relevant context that would be useful for analysis
 * - Group related events with consistent property names
 */
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
    (
      event: string,
      data?: Record<string, unknown> & Partial<EventTriggerInfo>,
    ) => {
      // Validate that at least elementType is provided for tracking context
      if (!data?.elementType) {
        console.warn(
          `Analytics tracking for "${event}" is missing required trigger information. Please include at least 'elementType' in tracking data.`,
          data,
        )
      }

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
