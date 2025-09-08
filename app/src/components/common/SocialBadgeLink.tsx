"use client"

import Link from "next/link"

import { useAnalytics } from "@/providers/AnalyticsProvider"

export default function SocialBadgeLink({
  icon,
  href,
  text,
  target = "_target",
  source,
  type,
}: {
  icon: React.ReactNode
  href: string
  text: string
  target?: React.HTMLAttributeAnchorTarget
  source?: string
  type?: string
}) {
  const { track } = useAnalytics()

  const handleClick = () => {
    track("Link Click", {
      href,
      text,
      source,
      linkName: `Social Link Click`,
      type,
      elementType: "link",
      elementName: text,
    })
  }

  const normalizedLink = (href: string): string => {
    if (!href.startsWith("@")) return href

    switch (type) {
      case "twitter":
      case "X":
        return `https://x.com/${href.slice(1)}`
      case "farcaster":
        return `https://farcaster.xyz/${href.slice(1)}`
      default:
        return href
    }
  }

  return (
    <div className="py-1 px-2.5 rounded-full bg-secondary text-sm font-normal flex items-center space-x-1">
      {icon}
      <Link href={normalizedLink(href)} target={target} onClick={handleClick}>
        {text}
      </Link>
    </div>
  )
}
