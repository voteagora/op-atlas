"use client"

import { Role } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"

import { useAnalytics } from "@/providers/AnalyticsProvider"

export const AnalyticsTracker = ({ role }: { role: Role }) => {
  const { data: session } = useSession()
  const viewerId =
    session?.impersonation?.targetUserId ?? session?.user?.id
  const adminUserId = session?.user?.id ?? null

  const { track } = useAnalytics()
  const isTracked = useRef(false)

  useEffect(() => {
    if (!isTracked.current) {
      track("Page View", {
        role_name: role.title,
        role_id: role.id,
        page_title: "Role Page",
        candidate_user_id: viewerId || null,
        admin_user_id: adminUserId,

        elementType: "Page View",
        elementName: "Role Page",
      })
      isTracked.current = true
    }
  }, [role])

  return null
}
