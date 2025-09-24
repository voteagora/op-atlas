"use client"

import { KYCUser } from "@prisma/client"
import { usePrivy } from "@privy-io/react-auth"

import { Button } from "@/components/common/Button"
import { Callout } from "@/components/common/Callout"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import PersonalKYCStatus from "./PersonalKYCStatus"

interface IdentityVerificationProps {
  userId: string
  kycUser?: KYCUser | null
}

export const IdentityVerification = ({
  userId,
  kycUser,
}: IdentityVerificationProps) => {
  const { user } = useUser({ id: userId, enabled: true })
  const { linkEmail } = usePrivyEmail(userId)
  const { user: privyUser } = usePrivy()

  // Check if user has email (same logic as EmailConnection)
  const email = user?.emails[0]?.email || privyUser?.email?.address
  const hasEmail = !!email

  // State 3: Has KYC - show status
  if (kycUser) {
    return <PersonalKYCStatus kycUser={kycUser} />
  }

  // State 1: No email - show red callout
  if (!hasEmail) {
    return (
      <Callout
        type="error"
        showIcon={true}
        leftAlignedContent={
          <div className="flex items-center">
            <div className="ml-3 text-sm font-medium">
              <span className="">
                You can't verify your identity until you've{" "}
              </span>
              <button
                onClick={linkEmail}
                className="underline hover:no-underline cursor-pointer"
              >
                added your email
              </button>
              .
            </div>
          </div>
        }
      />
    )
  }

  // State 2: Has email but no KYC - show buttons
  return (
    <div className="flex gap-2">
      <Button
        variant="primary"
        onClick={() => (window.location.href = "/profile/kyc")}
      >
        Get verified
      </Button>
      <Button
        variant="secondary"
        onClick={() => (window.location.href = "/profile/kyc")}
      >
        I've already completed KYC
      </Button>
    </div>
  )
}