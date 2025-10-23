"use client"

import { usePrivy } from "@privy-io/react-auth"
import Image from "next/image"

import { Button } from "@/components/common/Button"
import { CheckboxCircleFIll } from "@/components/icons/remix"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"

export const EmailConnection = ({ userId }: { userId: string }) => {
  const { user } = useUser({ id: userId, enabled: true })
  const { linkEmail, updateEmail } = usePrivyEmail(userId)
  const { user: privyUser } = usePrivy()

  const email = user?.emails[0]?.email || privyUser?.email?.address
  const isSyncing =
    user?.emails[0]?.email?.toLowerCase() !==
    privyUser?.email?.address?.toLowerCase()

  return (
    <div className="flex">
      {email && (
        <div
          className={`flex flex-row gap-2 min-w-0 flex-1 input-container ${
            isSyncing ? "opacity-50" : ""
          }`}
        >
          <CheckboxCircleFIll className="w-4 h-4 mr-1" fill="#1DBA6A" />
          <span className="text-secondary-foreground text-sm font-riforma">
            {email}
          </span>
        </div>
      )}
      <Button
        variant={email ? "secondary" : "primary"}
        onClick={() => {
          if (email) {
            updateEmail()
          } else {
            linkEmail()
          }
        }}
      >
        {email ? "Update" : "Add email"}
      </Button>
    </div>
  )
}
