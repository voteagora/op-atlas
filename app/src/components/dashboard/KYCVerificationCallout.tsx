"use client"

import { Shield, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Callout } from "@/components/common/Callout"
import TrackedLink from "@/components/common/TrackedLink"
import { UserKYCStatus } from "@/lib/actions/userKyc"

interface KYCVerificationCalloutProps {
  userKYCStatus: UserKYCStatus
}

export function KYCVerificationCallout({ userKYCStatus }: KYCVerificationCalloutProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  // Check if user has already dismissed this callout
  useEffect(() => {
    if (typeof window === 'undefined') return

    const dismissedCookie = document.cookie
      .split(';')
      .find(row => row.trim().startsWith('kycVerificationDismissed='))

    if (dismissedCookie) {
      const [, timestamp] = dismissedCookie.split('=')
      const dismissedTime = parseInt(timestamp)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)

      // Show again if more than 30 days have passed
      if (dismissedTime > thirtyDaysAgo) {
        setIsDismissed(true)
      }
    }
  }, [])

  const handleDismiss = useCallback(() => {
    // Set cookie with 30-day expiry
    const timestamp = Date.now()
    const maxAge = 30 * 24 * 60 * 60 // 30 days in seconds
    document.cookie = `kycVerificationDismissed=${timestamp}; max-age=${maxAge}; path=/`

    setIsDismissed(true)
  }, [])

  // Don't show if user already has valid KYC or has dismissed
  if (userKYCStatus.hasValidKYC || isDismissed) {
    return null
  }

  return (
    <Callout
      type="info"
      showIcon={false}
      leftAlignedContent={
        <div className="flex items-center">
          <Shield size={20} className="text-blue-600" />
          <div className="ml-3">
            <span className="text-sm font-medium text-blue-800">
              Complete KYC to unlock grant eligibility and streamline future applications.{" "}
            </span>
            <TrackedLink
              className="text-sm font-medium text-blue-800 underline"
              href="/profile/kyc"
              eventName="Link Click"
              eventData={{
                source: "Dashboard",
                linkName: "Start Verification",
                context: "KYC Verification Callout",
              }}
            >
              Start Verification
            </TrackedLink>
          </div>
        </div>
      }
      rightAlignedContent={
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            onClick={handleDismiss}
            className="text-sm font-medium text-blue-800 hover:text-blue-900 cursor-pointer"
          >
            Dismiss
          </button>
          <button
            onClick={handleDismiss}
            className="flex items-center justify-center text-blue-800 hover:text-blue-900"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      }
    />
  )
}