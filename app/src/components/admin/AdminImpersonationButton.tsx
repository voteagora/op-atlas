"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye } from "lucide-react"
import { UserSearchAutocomplete } from "./UserSearchAutocomplete"

type ImpersonationStatus = {
  enabled: boolean
  d1Available: boolean
  userIsAdmin: boolean
  currentlyImpersonating?: boolean
  adminWalletCount?: number
}

export function AdminImpersonationButton() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [starting, setStarting] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [impersonationStatus, setImpersonationStatus] = useState<ImpersonationStatus | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!session?.user?.id) {
      setImpersonationStatus(null)
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
          throw new Error(`Failed to fetch impersonation status (${response.status})`)
        }

        const data = await response.json()

        if (!cancelled) {
          setImpersonationStatus(data.status as ImpersonationStatus)
        }
      } catch (error) {
        console.error('Failed to load impersonation status:', error)
        if (!cancelled) {
          setImpersonationStatus(null)
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

  const canImpersonate =
    !!impersonationStatus?.enabled &&
    !!impersonationStatus?.d1Available &&
    !!impersonationStatus?.userIsAdmin

  // Only render for authenticated admins who aren't already impersonating
  if (
    status !== "authenticated" ||
    session?.impersonation?.isActive ||
    checkingAccess ||
    !canImpersonate
  ) {
    return null
  }

  const handleStartImpersonation = async (targetUserId: string) => {
    try {
      setStarting(true)

      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to start impersonation')
      }

      // Update session with impersonation data
      await update({
        ...session,
        impersonation: data.impersonation,
      })

      // Close dialog and navigate to home
      setOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Failed to start impersonation:', error)
      alert(error instanceof Error ? error.message : 'Failed to start impersonation')
    } finally {
      setStarting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 px-2 w-auto whitespace-nowrap"
          aria-label="View as user"
          disabled={starting}
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">View as User</span>
          <span className="sm:hidden text-xs font-medium">View</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <div className="flex flex-col text-center">
          <div className="font-semibold text-xl">
            Admin: View as User
          </div>

          <div className="text-base text-secondary-foreground mt-2">
            Search for a user to view the app from their perspective.
            You'll be using real-time production data, so do not modify anything accidentally.
          </div>

          <div className="mt-6">
            <UserSearchAutocomplete
              onSelectUser={handleStartImpersonation}
              disabled={starting}
              placeholder="Search for user"
              loading={starting}
              loadingText="Starting"
              focusOnOpen={open}
            />
          </div>

          <div className="text-sm text-secondary-foreground bg-muted p-3 rounded-md mt-4">
            <strong>Note:</strong> External services (emails, KYC, payments) will be mocked during impersonation.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
