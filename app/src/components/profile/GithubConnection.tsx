"use client"

import { usePrivy } from "@privy-io/react-auth"
import Image from "next/image"

import { Button } from "@/components/common/Button"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"
import { cn } from "@/lib/utils"

import { Checkbox } from "../ui/checkbox"

export const GithubConnection = ({ userId }: { userId: string }) => {
  const { user: privyUser } = usePrivy()
  const { user } = useUser({
    id: userId,
    enabled: true,
  })

  const { linkGithub, unlinkGithub, toggleIsDeveloper } = usePrivyLinkGithub(userId)

  const username = user?.github || privyUser?.github?.username
  const isSyncing =
    user?.github?.toLowerCase() !== privyUser?.github?.username?.toLowerCase()

  return (
    <div className="flex flex-col space-y-4">
      {username && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex flex-1 p-3 border items-center gap-1.5 rounded-lg h-10",
                isSyncing && "opacity-50",
              )}
            >
              <Image
                src="/assets/icons/githubIcon.svg"
                height={14}
                width={14}
                alt="Github"
              />
              <p className="text-sm">{username}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {username ? (
          <Button
            variant="secondary"
            onClick={unlinkGithub}
            className={cn(isSyncing && "opacity-50")}
          >
            Disconnect
          </Button>
        ) : (
          <>
            {!user?.notDeveloper && (
              <Button variant="primary" onClick={linkGithub}>
                Connect
              </Button>
            )}
          </>
        )}

        <div
          className={cn(
            "input-container text-sm",
            user?.notDeveloper && "bg-secondary",
          )}
        >
          <Checkbox
            checked={user?.notDeveloper}
            onCheckedChange={toggleIsDeveloper}
          />
          I&apos;m not a developer
        </div>
      </div>
    </div>
  )
}
