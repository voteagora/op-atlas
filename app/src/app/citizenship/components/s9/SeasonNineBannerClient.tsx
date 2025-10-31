"use client"

import Link from "next/link"
import { useEffect, useMemo, useId } from "react"
import { ArrowRight } from "lucide-react"

import { useTopBanner } from "@/providers/LayoutProvider"

type SeasonNineBannerClientProps = {
  priorityWindow: boolean
  registrationOpen: boolean
  seasonName: string
}

export function SeasonNineBannerClient({
  priorityWindow,
  registrationOpen,
  seasonName,
}: SeasonNineBannerClientProps) {
  const { registerTopBanner, unregisterTopBanner } = useTopBanner()
  const bannerId = useId()

  const shouldShow = priorityWindow || registrationOpen

  const bannerContent = useMemo(() => {
    if (!shouldShow) {
      return null
    }

    const message = priorityWindow
      ? `Early registration for citizenship in ${seasonName} is now open`
      : `Citizen registration for ${seasonName} is now open`

    return (
      <Link
        href="/citizenship"
        className="flex items-center justify-center gap-2 w-full bg-callout-foreground text-background text-sm font-medium px-4 py-3 text-center hover:bg-callout-foreground/80"
      >
        {message}
        <ArrowRight className="w-4 h-4" />
      </Link>
    )
  }, [priorityWindow, registrationOpen, shouldShow, seasonName])

  useEffect(() => {
    if (bannerContent) {
      registerTopBanner(bannerId, bannerContent)
    } else {
      registerTopBanner(bannerId, null)
    }
    return () => {
      unregisterTopBanner(bannerId)
    }
  }, [bannerContent, registerTopBanner, unregisterTopBanner, bannerId])

  return null
}
