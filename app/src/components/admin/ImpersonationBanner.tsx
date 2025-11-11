"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TriangleAlert, X, Eye } from "lucide-react"
import { UserSearchAutocomplete } from "./UserSearchAutocomplete"

export function ImpersonationBanner() {
  const { data: session, update } = useSession()
  const [isSwitching, setIsSwitching] = useState(false)
  const bannerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (
      !session?.impersonation?.isActive ||
      typeof window === "undefined" ||
      !bannerRef.current
    ) {
      document.documentElement.style.setProperty(
        "--impersonation-banner-height",
        "0px",
      )
      return
    }

    const node = bannerRef.current

    const updateHeight = () => {
      const height = node?.offsetHeight ?? 0
      document.documentElement.style.setProperty(
        "--impersonation-banner-height",
        `${height}px`,
      )
    }

    updateHeight()

    let resizeObserver: ResizeObserver | null = null

    if (typeof ResizeObserver !== "undefined" && node) {
      resizeObserver = new ResizeObserver(() => updateHeight())
      resizeObserver.observe(node)
    } else {
      window.addEventListener("resize", updateHeight)
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      } else {
        window.removeEventListener("resize", updateHeight)
      }
      document.documentElement.style.setProperty(
        "--impersonation-banner-height",
        "0px",
      )
    }
  }, [
    session?.impersonation?.isActive,
    session?.impersonation?.targetUserId,
    session?.impersonation?.targetUserName,
    session?.impersonation?.targetUserEmail,
  ])

  if (!session?.impersonation?.isActive) {
    return null
  }

  const handleStopImpersonation = async () => {
    try {
      setIsSwitching(true)

      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to stop impersonation')
      }

      // CRITICAL: Clear impersonation from session (triggers new JWT without impersonation)
      await update({ impersonation: null })

      // Reload to return to admin view
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to stop impersonation:', error)
      alert('Failed to stop impersonation. Please try again or refresh the page.')
    } finally {
      setIsSwitching(false)
    }
  }

  const handleSwitchUser = async (targetUserId: string) => {
    try {
      setIsSwitching(true)

      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to switch user')
      }

      // Update session with new impersonation data
      await update({ impersonation: data.impersonation })

      // Reload to see new user's view
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to switch user:', error)
      alert(error instanceof Error ? error.message : 'Failed to switch user')
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <div ref={bannerRef} className="sticky top-0 z-[320]">
      <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950 rounded-none mb-0 shadow-md px-4 sm:px-6">
        <TriangleAlert className="h-4 w-4" />
        <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <strong className="text-sm">Admin Mode: Viewing as {session.impersonation.targetUserName}</strong>
            </div>
            <span className="text-xs text-muted-foreground">
              Using yesterday&apos;s data snapshot • Changes won&apos;t affect production
              {session.impersonation.targetUserEmail && (
                <> • {session.impersonation.targetUserEmail}</>
              )}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:items-center sm:justify-end">
            <div className="w-full sm:w-auto">
              <UserSearchAutocomplete
                onSelectUser={handleSwitchUser}
                disabled={isSwitching}
                placeholder="Switch user..."
                currentUserId={session.impersonation.targetUserId}
              />
            </div>

            <Button
              onClick={handleStopImpersonation}
              disabled={isSwitching}
              variant="outline"
              size="sm"
              className="whitespace-nowrap w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-1" />
              {isSwitching ? 'Stopping...' : 'Exit Admin Mode'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
