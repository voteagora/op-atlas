"use client"

import { User } from "@prisma/client"
import { setCookie } from "cookies-next"
import Image from "next/image"
import { usePathname } from "next/navigation"
import React from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { connectDiscord, removeDiscord } from "@/lib/actions/users"
import { DISCORD_REDIRECT_COOKIE } from "@/lib/utils"

export function DiscordConnection({ user }: { user: User }) {
  const [isPending, startTransition] = React.useTransition()
  const pathname = usePathname()

  const authorizeDiscord = async () => {
    setCookie(DISCORD_REDIRECT_COOKIE, pathname)

    return connectDiscord()
  }

  const disconnectDiscord = async () => {
    startTransition(async () => {
      try {
        const result = await removeDiscord()
        if (result.error !== null) {
          throw result.error
        }
      } catch (error) {
        console.error("Error disconnecting Discord", error)
        toast.error("Error disconnecting Discord")
      }
    })
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

            <Button
              variant="secondary"
              onClick={disconnectDiscord}
              disabled={isPending}
            >
              Disconnect
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button disabled={!!user.discord} onClick={authorizeDiscord}>
          Connect
        </Button>
      </div>
    </div>
  )
}
