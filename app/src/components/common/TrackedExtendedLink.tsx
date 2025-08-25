"use client"

import { useAnalytics } from "@/providers/AnalyticsProvider"

import ExtendedLink from "./ExtendedLink"

interface TrackedExtendedLinkProps {
  href: string
  text: string
  eventName: string
  eventData?: Record<string, unknown>
  as?: "button" | "a"
  variant?: "default" | "primary" | "ghost"
  className?: string
  icon?: React.ReactNode
  subtext?: string
  showOutboundLinkIcon?: boolean
  target?: React.HTMLAttributeAnchorTarget
}

export default function TrackedExtendedLink({
  href,
  text,
  eventName,
  eventData,
  ...props
}: TrackedExtendedLinkProps) {
  const { track } = useAnalytics()

  const handleClick = () => {
    track(eventName, {
      ...eventData,
      elementType: "link",
      elementName: text,
      url: href,
      href, // Keep for backward compatibility
      text, // Keep for backward compatibility
    })
  }

  return (
    <ExtendedLink href={href} text={text} onClick={handleClick} {...props} />
  )
}
