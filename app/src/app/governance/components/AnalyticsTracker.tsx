"use client"

import { useEffect, useRef } from "react"

import { useAnalytics } from "@/providers/AnalyticsProvider"

export const AnalyticsTracker = () => {
  const { track } = useAnalytics()
  const isTracked = useRef(false)

  useEffect(() => {
    if (!isTracked.current) {
      track("Page View", {
        page_title: "Governance",
      })
      isTracked.current = true
    }
  }, [])

  return null
}
