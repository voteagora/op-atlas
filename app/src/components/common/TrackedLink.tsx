"use client"

import Link, { LinkProps } from "next/link"

import { useAnalytics } from "@/providers/AnalyticsProvider"

interface TrackedLinkProps extends LinkProps {
  eventName: string
  eventData?: Record<string, unknown>
  target?: React.HTMLAttributeAnchorTarget
  children: React.ReactNode
  linkName?: string // Optional name for the link for better tracking
}

export default function TrackedLink({
  eventName,
  eventData,
  children,
  className,
  target = "_self",
  linkName,
  ...props
}: TrackedLinkProps & { className?: string }) {
  const { track } = useAnalytics()

  const handleClick = () => {
    track(eventName, {
      ...eventData,
      elementType: "link",
      elementName:
        linkName || (typeof children === "string" ? children : "unknown"),
      url: typeof props.href === "string" ? props.href : undefined,
      href: props.href, // Keep for backward compatibility
    })
  }

  return (
    <Link
      {...props}
      className={className}
      onClick={handleClick}
      target={target}
    >
      {children}
    </Link>
  )
}
