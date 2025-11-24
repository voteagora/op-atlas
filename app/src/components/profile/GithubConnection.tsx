"use client"

import { usePrivy } from "@privy-io/react-auth"
import { X } from "lucide-react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/common/Button"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"
import { cn } from "@/lib/utils"

import { Github } from "../icons/socials"

type HookedUser = ReturnType<typeof useUser>["user"]

type GithubConnectionProps = {
  userId: string
  hideNotDeveloperToggle?: boolean
  readOnly?: boolean
}

export const GithubConnection = ({
  userId,
  hideNotDeveloperToggle,
  readOnly = false,
}: GithubConnectionProps) => {
  const { user } = useUser({
    id: userId,
    enabled: true,
  })
  const { user: privyUser } = usePrivy()

  if (readOnly) {
    return (
      <GithubConnectionReadOnly
        user={user}
        hideNotDeveloperToggle={hideNotDeveloperToggle}
      />
    )
  }

  return (
    <GithubConnectionInteractive
      userId={userId}
      user={user}
      privyUser={privyUser}
      hideNotDeveloperToggle={hideNotDeveloperToggle}
    />
  )
}

const GithubConnectionReadOnly = ({
  user,
  hideNotDeveloperToggle,
}: {
  user: HookedUser
  hideNotDeveloperToggle?: boolean
}) => {
  const username = user?.github
  return (
    <div className="flex flex-row gap-2 items-center">
      <div className="flex flex-row gap-2 min-w-0 flex-1 input-container text-foreground">
        {username ? (
          <>
            <Github className="w-4 h-4 mr-1" />
            <span className="text-sm break-all">@{username}</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            GitHub not connected.
          </span>
        )}
      </div>
      <Button variant="secondary" disabled>
        Unavailable while impersonating
      </Button>
      {!hideNotDeveloperToggle && username && (
        <span className="text-xs text-muted-foreground">
          Connection read-only
        </span>
      )}
    </div>
  )
}

const GithubConnectionInteractive = ({
  userId,
  user,
  privyUser,
  hideNotDeveloperToggle,
}: {
  userId: string
  user: HookedUser
  privyUser: ReturnType<typeof usePrivy>["user"]
  hideNotDeveloperToggle?: boolean
}) => {
  const { linkGithub, unlinkGithub } = usePrivyLinkGithub(userId)
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
            className={cn("w-10 h-10", isSyncing && "opacity-50")}
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
  const { data: session } = useSession()
  const { user } = useUser({ id: userId, enabled: true })
  const { user: privyUser } = usePrivy()
  const { toggleIsDeveloper } = usePrivyLinkGithub(userId)

  if (session?.impersonation?.isActive) {
    return null
  }

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
