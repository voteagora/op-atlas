"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Ban } from "lucide-react"

type AdminStatus = {
  enabled: boolean
  userIsAdmin: boolean
}

export function AdminBlacklistButton() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!session?.user?.id) {
      setAdminStatus(null)
      setCheckingAccess(false)
      return
    }

    async function fetchStatus() {
      try {
        setCheckingAccess(true)
        const response = await fetch('/api/admin/impersonation-status', {
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch admin status (${response.status})`)
        }

        const data = await response.json()

        if (!cancelled) {
          setAdminStatus({
            enabled: data.status?.enabled || false,
            userIsAdmin: data.status?.userIsAdmin || false,
          })
        }
      } catch (error) {
        console.error('Failed to load admin status:', error)
        if (!cancelled) {
          setAdminStatus(null)
        }
      } finally {
        if (!cancelled) {
          setCheckingAccess(false)
        }
      }
    }

    fetchStatus()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  const canAccess = !!adminStatus?.enabled && !!adminStatus?.userIsAdmin

  // Only render for authenticated admins
  if (
    status !== "authenticated" ||
    checkingAccess ||
    !canAccess
  ) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 px-2 w-auto whitespace-nowrap"
      aria-label="Manage blacklist"
      onClick={() => router.push('/admin/blacklist')}
    >
      <Ban className="h-4 w-4" />
      <span className="hidden sm:inline">Blacklist</span>
    </Button>
  )
}
