"use client"

import Link, { LinkProps } from "next/link"

import { useAnalytics } from "@/providers/AnalyticsProvider"

interface TrackedLinkProps extends LinkProps {
  eventName: string
  eventData?: Record<string, unknown>
  target?: React.HTMLAttributeAnchorTarget
  children: React.ReactNode
}

export default function TrackedLink({
  eventName,
  eventData,
  children,
  className,
  target = "_self",
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
