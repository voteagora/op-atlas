"use client"

import { Role } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"

import { useAnalytics } from "@/providers/AnalyticsProvider"

export const AnalyticsTracker = ({ role }: { role: Role }) => {
  const { data: session } = useSession()

  const { track } = useAnalytics()
  const isTracked = useRef(false)

  useEffect(() => {
    if (!isTracked.current) {
      track("Page View", {
        role_name: role.title,
        role_id: role.id,
        page_title: "Candidate Profile",
        candidate_user_id: session?.user?.id || null,
        elementType: "Page View",
        elementName: "Candidate Profile",
      })
      isTracked.current = true
    }
  }, [role])

  return null
}
