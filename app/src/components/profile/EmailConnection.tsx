"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useSession } from "next-auth/react"

import { Button } from "@/components/common/Button"
import { CheckboxCircleFIll } from "@/components/icons/remix"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"

type HookedUser = ReturnType<typeof useUser>["user"]

export const EmailConnection = ({ userId }: { userId: string }) => {
  const { data: session } = useSession()
  const isImpersonating = !!session?.impersonation?.isActive
  const { user } = useUser({ id: userId, enabled: true })
  const { user: privyUser } = usePrivy()

  if (isImpersonating) {
    return (
      <EmailConnectionReadOnly
        user={user}
      />
    )
  }

  return (
    <EmailConnectionInteractive
      user={user}
      privyEmail={privyUser?.email?.address}
      userId={userId}
    />
  )
}

const EmailConnectionReadOnly = ({
  user,
}: {
  user: HookedUser
}) => {
  const email = user?.emails[0]?.email

  return (
    <div className="flex gap-2">
      <div className="flex flex-row gap-2 min-w-0 flex-1 input-container text-foreground">
        {email ? (
          <>
            <CheckboxCircleFIll className="w-4 h-4 mr-1" fill="#1DBA6A" />
            <span className="text-foreground text-sm font-riforma break-all">
              {email}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            No email connected.
          </span>
        )}
      </div>
      <Button variant="secondary" disabled>
        Unavailable while impersonating
      </Button>
    </div>
  )
}

const EmailConnectionInteractive = ({
  user,
  privyEmail,
  userId,
}: {
  user: HookedUser
  privyEmail?: string
  userId: string
}) => {
  const { linkEmail, updateEmail } = usePrivyEmail(userId)

  const email = user?.emails[0]?.email || privyEmail
  const isSyncing =
    user?.emails[0]?.email?.toLowerCase() !==
    privyEmail?.toLowerCase()

  return (
    <div className="flex gap-2">
      {email && (
        <div
          className={`flex flex-row gap-2 min-w-0 flex-1 input-container text-foreground cursor-text select-text ${
            isSyncing ? "opacity-70" : ""
          }`}
        >
          <CheckboxCircleFIll className="w-4 h-4 mr-1" fill="#1DBA6A" />
          <span className="text-foreground text-sm font-riforma break-all">
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
