"use client"

import { User } from "@prisma/client"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import {
  setUserIsNotDeveloper
} from "@/lib/actions/users"
import { cn } from "@/lib/utils"

import { syncPrivyUser } from "@/db/users"
import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import { Checkbox } from "../ui/checkbox"

export function GithubConnection({ user }: { user: User }) {


  const { user: privyUser, unlinkGithub } = usePrivy()
  const { linkGithub } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      if (linkMethod === "github") {
        toast.promise(syncPrivyUser(updatedPrivyUser), {
          loading: "Linking github...",
          success: "Github linked successfully",
          error: "Failed to link github",
        })
      }
    },
  })

  const handleUnlinkGithub = () => {
    if (privyUser?.github?.subject) {
      toast.promise(unlinkGithub(privyUser.github.subject), {
        loading: "Unlinking github...",
        success: (updatedPrivyUser) => {
          syncPrivyUser(updatedPrivyUser)
          return "Github unlinked successfully"
        },
        error: "Failed to unlink github",
      })
    }
  }

  const pathname = usePathname()

  const [userNotDeveloper, setUserNotDeveloper] = useState(user.notDeveloper)
  const [isPending, startTransition] = useTransition()

  const toggleIsDeveloper = async () => {
    startTransition(async () => {
      try {
        const isNotDeveloper = !user.notDeveloper
        setUserNotDeveloper(isNotDeveloper)
        const result = await setUserIsNotDeveloper(isNotDeveloper)
        if (result.error !== null) {
          throw result.error
        }
      } catch (error) {
        console.error("Error toggling developer status", error)
        toast.error("Error updating developer status")
      }
    })
  }


  return (
    <div className="flex flex-col space-y-4">
      <div>
        <div className="flex items-center space-x-1.5">
          <Image
            src="/assets/icons/githubIcon.svg"
            alt="Github"
            height={20}
            width={20}
          />
          <h3 className="font-semibold text-foreground">Github</h3>
        </div>
        <p className="text-secondary-foreground">
          Connect your GitHub account to show your code contributions to the
          Optimism Collective.
        </p>
      </div>

      {privyUser?.github?.username && (
        <div className="flex flex-col gap-2">
          <p className="font-medium text-sm text-foreground">
            Your GitHub username
          </p>
          <div className="flex items-center gap-1.5">
            <div className="flex flex-1 p-3 border items-center gap-1.5 rounded-lg h-10">
              <Image
                src="/assets/icons/circle-check-green.svg"
                height={16.67}
                width={16.67}
                alt="Verified"
              />
              <p className="text-sm">{privyUser?.github?.username}</p>
            </div>

          </div>
        </div>
      )}

      <div className="flex gap-2">
        {privyUser?.github?.username ?
          <Button variant="secondary" onClick={handleUnlinkGithub}>Disconnect</Button>
          :
          <Button variant="primary" onClick={linkGithub}>Connect</Button>
        }

        <div
          className={cn(
            "input-container text-sm",
            userNotDeveloper && "bg-secondary",
          )}
        >
          <Checkbox
            checked={userNotDeveloper}
            onCheckedChange={toggleIsDeveloper}
            className=""
            disabled={isPending}
          />
          I&apos;m not a developer
        </div>
      </div>
    </div>
  )
}
