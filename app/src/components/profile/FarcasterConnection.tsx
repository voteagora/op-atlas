"use client"

import { usePrivy } from "@privy-io/react-auth"
import Image from "next/image"
import { X } from "lucide-react"

import { CheckboxCircleFIll } from "@/components/icons/remix"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyFarcaster } from "@/hooks/privy/usePrivyFarcaster"
import { cn } from "@/lib/utils"

import { Button } from "../common/Button"

export const FarcasterConnection = ({
  userId,
  children,
}: {
  userId: string
  children: React.ReactNode
}) => {
  const { user } = useUser({
    id: userId,
    enabled: true,
  })

  const { user: privyUser } = usePrivy()
  const { linkFarcaster, unlinkFarcaster } = usePrivyFarcaster(userId)

  const isIntermediateState =
    Number(user?.farcasterId || 0) !== privyUser?.farcaster?.fid
  const username = user?.farcasterId
    ? user.username
    : privyUser?.farcaster?.username

  return (
    <div className="flex flex-row gap-2">
      {username && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex flex-1 p-3 border items-center gap-1.5 rounded-lg h-10",
                isIntermediateState && "opacity-50",
              )}
            >
              <CheckboxCircleFIll className="w-4 h-4" fill="#1DBA6A" />
              <p className="text-sm">@{username}</p>
            </div>
          </div>
        </div>
      )}

      {username ? (
        <Button
          variant="secondary"
          size="icon"
          aria-label="Disconnect Farcaster"
          onClick={unlinkFarcaster}
          className={cn(isIntermediateState && "opacity-50")}
        >
          <X className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          variant="secondary"
          onClick={(event) => {
            event.preventDefault()
            linkFarcaster()
          }}
        >
          {children}
        </Button>
      )}
    </div>
  )
}
