"use client"

import Link, { LinkProps } from "next/link"

import { useAnalytics } from "@/providers/AnalyticsProvider"

interface TrackedLinkProps extends LinkProps {
  eventName: string
  eventData?: Record<string, unknown>
  children: React.ReactNode
}

export default function TrackedLink({
  eventName,
  eventData,
  children,
  className,
  ...props
}: TrackedLinkProps & { className?: string }) {
  const { track } = useAnalytics()

  const handleClick = () => {
    track(eventName, {
      ...eventData,
      href: props.href,
    })
  }

  return (
    <Link {...props} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
