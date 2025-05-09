"use client"

import { usePrivy } from "@privy-io/react-auth"
import { Mail } from "lucide-react"

import { Button } from "@/components/common/Button"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"

export const EmailConnection = ({ userId }: { userId: string }) => {
  const { user } = useUser({ id: userId, enabled: true })
  const { linkEmail, updateEmail, unlinkEmail } = usePrivyEmail(userId)
  const { user: privyUser } = usePrivy()

  const email = user?.emails[0]?.email || privyUser?.email?.address
  const isSyncing =
    user?.emails[0]?.email?.toLowerCase() !==
    privyUser?.email?.address?.toLowerCase()

  return (
    <div className="flex space-x-1.5">
      {email && (
        <div className={`input-container ${isSyncing ? "opacity-50" : ""}`}>
          <Mail size={16} fill="#0F111A" color="#fff" />
          <span>{email}</span>
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

      {email && (
        <Button variant="secondary" onClick={unlinkEmail}>
          Delete
        </Button>
      )}
    </div>
  )
}
