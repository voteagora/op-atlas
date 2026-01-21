"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useState } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { useUser } from "@/hooks/db/useUser"
import { updateEmailNotificationPreference } from "@/lib/actions/users"

export const EmailNotificationCheckbox = ({ userId }: { userId: string }) => {
  const { user, invalidate, isLoading } = useUser({ id: userId, enabled: true })
  const { user: privyUser } = usePrivy()
  const [isUpdating, setIsUpdating] = useState(false)

  if (isLoading) {
    return null
  }

  // Check for verified email in database OR Privy email (Privy emails are considered verified)
  const hasVerifiedEmail =
    user?.emails?.some((email) => email.verified) || !!privyUser?.email?.address

  if (!hasVerifiedEmail) {
    return null
  }

  const handleToggle = async (checked: boolean) => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      await updateEmailNotificationPreference(checked)
      await invalidate()
    } catch (error) {
      console.error("Failed to update email notification preference:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        checked={user?.emailNotifEnabled ?? false}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
      />
      <span className="text-sm font-normal leading-none">
        Get notified of Citizen House proposals
      </span>
    </div>
  )
}
