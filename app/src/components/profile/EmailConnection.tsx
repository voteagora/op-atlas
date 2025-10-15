"use client"

import { usePrivy } from "@privy-io/react-auth"
import Image from "next/image"

import { Button } from "@/components/common/Button"
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
        <div className={`flex flex-row gap-2 min-w-0 flex-1 input-container ${isSyncing ? "opacity-50" : ""}`}>
          <Image
            src="/assets/icons/circle-check-green.svg"
            height={16.67}
            width={16.67}
            alt="Verified"
            className="mr-1"
          />
          <span className="text-secondary-foreground text-sm font-riforma">{email}</span>
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
