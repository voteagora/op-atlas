"use client"

import { useEffect, useRef } from "react"

import { CitizenshipQualification } from "@/lib/types"
import { useAnalytics } from "@/providers/AnalyticsProvider"

export const AnalyticsTracker = ({
  qualification,
}: {
  qualification: CitizenshipQualification | null
}) => {
  const { track } = useAnalytics()
  const isTracked = useRef(false)

  useEffect(() => {
    if (!isTracked.current) {
      track("Page View", {
        user_group: qualification?.type,
        eligible: qualification?.eligible || false,
        page_title: "Citizenship",
        elementType: "Page View",
        elementName: "Citizenship",
      })
      isTracked.current = true
    }
  }, [qualification])

  return null
}
