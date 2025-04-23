"use client"

import { User } from "@prisma/client"
import Image from "next/image"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { syncPrivyUser } from "@/db/users"
import { useLinkAccount, usePrivy } from "@privy-io/react-auth"

export function DiscordConnection({ user }: { user: User }) {

  const { user: privyUser, unlinkDiscord } = usePrivy()

  const { linkDiscord } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser }) => {

      toast.promise(syncPrivyUser(updatedPrivyUser), {
        loading: "Linking discord...",
        success: "Discord linked successfully",
        error: "Failed to link discord",
      })
    }
  })

  const handleUnlinkDiscord = () => {
    if (privyUser?.discord?.username) {
      toast.promise(unlinkDiscord(privyUser.discord.username), {
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
    <div className="flex flex-col space-y-4">
      <div>
        <div className="flex items-center space-x-1.5">
          <Image
            src="/assets/icons/discordIcon.svg"
            alt="Discord"
            height={20}
            width={20}
          />
          <h3 className="font-semibold text-foreground">Discord</h3>
        </div>
        <p className="text-secondary-foreground">
          Connect your account so anyone can find you on Discord.
        </p>
      </div>
      {user.discord && (
        <div className="flex flex-col gap-2">
          <p className="font-medium text-sm text-foreground">
            Your Discord username
          </p>
          <div className="flex items-center gap-1.5">
            <div className="flex flex-1 p-3 border items-center gap-1.5 rounded-lg h-10">
              <Image
                src="/assets/icons/circle-check-green.svg"
                height={16.67}
                width={16.67}
                alt="Verified"
              />

              <p className="text-sm">{user.discord}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {privyUser?.discord?.username ?
          <Button variant="secondary" onClick={handleUnlinkDiscord}>Disconnect</Button>
          :
          <Button variant="primary" onClick={linkDiscord}>Connect XX</Button>
        }
      </div>
    </div>
  )
}
