"use client"

import { useSession } from "next-auth/react"

import { useUser } from "@/hooks/db/useUser"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"

import { Github } from "../icons/socials"

type HookedUser = ReturnType<typeof useUser>["user"]

export const GithubDisplay = ({ userId }: { userId: string }) => {
  const { data: session } = useSession()
  const isImpersonating = !!session?.impersonation?.isActive
  const { user } = useUser({
    id: userId,
    enabled: true,
  })

  if (isImpersonating) {
    return <GithubDisplayReadOnly user={user} />
  }

  return <GithubDisplayInteractive user={user} userId={userId} />
}

const GithubDisplayReadOnly = ({ user }: { user: HookedUser }) => {
  const username = user?.github
  if (!username) return null

  return (
    <div className="flex flex-row justify-between p-3 border items-center gap-1.5 rounded-lg h-10">
      <div className="flex flex-row items-center gap-1.5">
        <Github className="w-4 h-4 mr-1" />
        <p className="text-sm">{username}</p>
      </div>
      <span className="text-xs text-muted-foreground">
        Read-only while impersonating
      </span>
    </div>
  )
}

const GithubDisplayInteractive = ({
  user,
  userId,
}: {
  user: HookedUser
  userId: string
}) => {
  const { unlinkGithub } = usePrivyLinkGithub(userId)
  const username = user?.github

  if (!username) return null

  return (
    <div className="flex flex-row justify-between p-3 border items-center gap-1.5 rounded-lg h-10">
      <div className="flex flex-row items-center gap-1.5">
        <Github className="w-4 h-4 mr-1" />
        <p className="text-sm">{username}</p>
      </div>
      <button
        className="text-sm text-secondary-foreground cursor-pointer bg-transparent border-none p-0 hover:opacity-80"
        aria-label="Disconnect GitHub"
        onClick={() => unlinkGithub()}
      >
        ✕
      </button>
    </div>
  )
}
