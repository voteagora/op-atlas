"use client"

import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import Image from "next/image"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/db/useUser"
import { useHandlePrivyErrors } from "@/hooks/useHandlePrivyErrors"
import { cn } from "@/lib/utils"

export const DiscordConnection = ({ userId }: { userId: string }) => {
  const { user: privyUser, unlinkDiscord } = usePrivy()
  const { user, invalidate: invalidateUser } = useUser({
    id: userId,
    enabled: true,
  })

  const username = user?.discord || privyUser?.discord?.username
  const isSyncing =
    user?.discord?.toLowerCase() !== privyUser?.discord?.username?.toLowerCase()

  const onError = useHandlePrivyErrors()
  const { linkDiscord } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      if (linkMethod === "discord") {
        toast.promise(
          syncPrivyUser(updatedPrivyUser).then(() => invalidateUser()),
          {
            loading: "Linking discord...",
            success: "Discord linked successfully",
            error: "Failed to link discord",
          },
        )
      }
    },
    onError,
  })

  const handleUnlinkDiscord = () => {
    if (user?.discord && privyUser?.discord?.subject) {
      toast.promise(unlinkDiscord(privyUser.discord.subject), {
        loading: "Unlinking discord...",
        success: (updatedPrivyUser) => {
          syncPrivyUser(updatedPrivyUser).then(() => invalidateUser())
          return "Discord unlinked successfully"
        },
        error: (error) => {
          return error.message
        },
      })
    }
  }

  return (
    <div className="flex flex-row gap-2">
      {username && (
        <div className="flex flex-col gap-2">
          <div>
            <div
              className={cn(
                "flex flex-1 p-3 border items-center gap-1.5 rounded-lg h-10",
                isSyncing && "opacity-50",
              )}
            >
              <Image
                src="/assets/icons/circle-check-green.svg"
                height={16.67}
                width={16.67}
                alt="Verified"
              />
              <p className="text-sm">@{username}</p>
            </div>
          </div>
        </div>
      )}

      {username ? (
        <Button
          variant="secondary"
          onClick={handleUnlinkDiscord}
          className={cn(isSyncing && "opacity-50")}
        >
          Disconnect
        </Button>
      ) : (
        <Button variant="primary" onClick={linkDiscord}>
          Connect
        </Button>
      )}
    </div>
  )
}
