"use client"

import { KYCUser } from "@prisma/client"
import { usePrivy } from "@privy-io/react-auth"
import { useTransition } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/common/Button"
import { Callout } from "@/components/common/Callout"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import { createUserKYC } from "@/lib/actions/userKyc"
import { useAppDialogs } from "@/providers/DialogProvider"
import PersonalKYCStatus from "./PersonalKYCStatus"

interface IdentityVerificationProps {
  userId: string
  kycUser?: KYCUser | null
}

export const IdentityVerification = ({
  userId,
  kycUser,
}: IdentityVerificationProps) => {
  const [isPending, startTransition] = useTransition()
  const { user } = useUser({ id: userId, enabled: true })
  const { linkEmail } = usePrivyEmail(userId)
  const { user: privyUser } = usePrivy()
  const { setOpenDialog, setData } = useAppDialogs()

  // Check if user has email (same logic as EmailConnection)
  const email = user?.emails[0]?.email || privyUser?.email?.address
  const hasEmail = !!email

  const handleGetVerified = () => {
    if (!email) {
      toast.error("Email is required to start KYC verification")
      return
    }

    startTransition(async () => {
      try {
        const result = await createUserKYC({ email })

        if (result.error) {
          toast.error(result.error)
          return
        }

        if (result.success) {
          // Set dialog data with email and whether this was a new user
          setData({
            email,
            isNewUser: result.isNewUser,
          })
          // Open the KYC email verification dialog
          setOpenDialog("kyc_email_verification")
        }
      } catch (error) {
        console.error("Error starting KYC:", error)
        toast.error("Failed to start verification. Please try again.")
      }
    })
  }

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
                You can&apos;t verify your identity until you&apos;ve{" "}
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
        onClick={handleGetVerified}
        disabled={isPending}
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Get verified
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          setData({ email })
          setOpenDialog("find_my_kyc")
        }}
      >
        I&apos;ve already completed KYC
      </Button>
    </div>
  )
}