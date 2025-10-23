"use client"

import { usePrivy } from "@privy-io/react-auth"
import Image from "next/image"
import { X } from "lucide-react"

import { Button } from "@/components/common/Button"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"
import { cn } from "@/lib/utils"

import { Github } from "../icons/socials"

export const GithubConnection = ({
  userId,
  hideNotDeveloperToggle,
}: {
  userId: string
  hideNotDeveloperToggle?: boolean
}) => {
  const { user: privyUser } = usePrivy()
  const { user } = useUser({
    id: userId,
    enabled: true,
  })

  const { linkGithub, unlinkGithub, toggleIsDeveloper } =
    usePrivyLinkGithub(userId)

  const username = user?.github || privyUser?.github?.username
  const isSyncing =
    user?.github?.toLowerCase() !== privyUser?.github?.username?.toLowerCase()

  return (
    <div className="flex flex-row gap-2">
      {username && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 border rounded-lg h-10 px-3",
                isSyncing && "opacity-50",
              )}
            >
              <Github className="w-4 h-4 mr-1" />
              <p className="text-sm">@{username}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {username ? (
          <Button
            variant="secondary"
            size="icon"
            aria-label="Disconnect GitHub"
            onClick={unlinkGithub}
            className={cn(isSyncing && "opacity-50")}
          >
            <X className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="secondary" onClick={linkGithub}>
            Connect
          </Button>
        )}

        {!hideNotDeveloperToggle && <GithubNotDeveloperHint />}
      </div>
    </div>
  )
}

export const GithubNotDeveloperToggle = ({ userId }: { userId: string }) => {
  const { user } = useUser({ id: userId, enabled: true })
  const { user: privyUser } = usePrivy()
  const { toggleIsDeveloper } = usePrivyLinkGithub(userId)

  const isConnected = Boolean(user?.github || privyUser?.github?.username)
  if (isConnected) return null

  return (
    <div className={cn("text-sm w-fit mt-4 gap-2 flex items-center")}>
      <Checkbox
        checked={user?.notDeveloper}
        onCheckedChange={toggleIsDeveloper}
      />
      I&apos;m not a developer
    </div>
  )
}

const GithubNotDeveloperHint = () => null
