"use client"

import { Session } from "next-auth"
import Image from "next/image"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/useUser"
import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import { useQueryClient } from "@tanstack/react-query"
export const DiscordConnection = ({ session }: { session: Session }) => {

  const { user: privyUser, unlinkDiscord } = usePrivy()

  const { user } = useUser({ id: session.user.id, enabled: !!session.user })
  const queryClient = useQueryClient()


  const username = user?.discord || privyUser?.discord?.username;


  const { linkDiscord } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      if (linkMethod === "discord") {
        toast.promise(syncPrivyUser(updatedPrivyUser), {
          loading: "Linking discord...",
          success: "Discord linked successfully",
          error: "Failed to link discord",
        })
      }
    }
  })

  const handleUnlinkDiscord = () => {
    if (privyUser?.discord?.subject) {
      toast.promise(unlinkDiscord(privyUser.discord.subject), {
        loading: "Unlinking discord...",
        success: (updatedPrivyUser) => {
          syncPrivyUser(updatedPrivyUser)
          return "Discord unlinked successfully"
        },
        error: "Failed to unlink discord",
      })
    }
  }

  return (
    <div className="flex flex-row gap-2">
      {username && (
        <div className="flex flex-col gap-2">
          <div>
            <div className="flex flex-1 p-3 border items-center gap-1.5 rounded-lg h-10">
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


      {username ?
        <Button variant="secondary" onClick={handleUnlinkDiscord}>Disconnect</Button>
        :
        <Button variant="primary" onClick={linkDiscord}>Connect</Button>
      }
    </div>
  )
}
