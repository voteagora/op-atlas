"use client"

import Image from "next/image"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import {
  setUserIsNotDeveloper
} from "@/lib/actions/users"
import { cn } from "@/lib/utils"

import { syncPrivyUser } from "@/db/privy"
import { useHandlePrivyErrors } from "@/hooks/useHandlePrivyErrors"
import { useUser } from "@/hooks/useUser"
import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import { Checkbox } from "../ui/checkbox"

export const GithubConnection = ({ userId }: { userId: string }) => {


  const { user: privyUser, unlinkGithub } = usePrivy()
  const { user, invalidate: invalidateUser } = useUser({ id: userId, enabled: true })
  const onError = useHandlePrivyErrors()

  const [userNotDeveloper, setUserNotDeveloper] = useState(user?.notDeveloper)
  const [isPending, startTransition] = useTransition()

  const username = user?.github || privyUser?.github?.username;
  const isIntermediateState = user?.github?.toLowerCase() !== privyUser?.github?.username?.toLowerCase();

  const { linkGithub } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      if (linkMethod === "github") {
        toast.promise(syncPrivyUser(updatedPrivyUser)
          .then(() => invalidateUser()),
          {
            loading: "Linking github...",
            success: "Github linked successfully",
            error: "Failed to link github",
          })
      }
    },
    onError
  })

  const handleUnlinkGithub = () => {
    if (privyUser?.github?.subject) {
      toast.promise(unlinkGithub(privyUser.github.subject), {
        loading: "Unlinking github...",
        success: (updatedPrivyUser) => {
          syncPrivyUser(updatedPrivyUser)
            .then(() => invalidateUser())
          return "Github unlinked successfully"
        },
        error: "Failed to unlink github",
      })
    }
  }


  const toggleIsDeveloper = async () => {
    startTransition(async () => {
      try {
        const isNotDeveloper = !user?.notDeveloper
        setUserNotDeveloper(isNotDeveloper)
        const result = await setUserIsNotDeveloper(isNotDeveloper)
        if (result.error !== null) {
          throw result.error
        }
      } catch (error) {
        toast.error("Error updating developer status")
      }
    })
  }


  return (
    <div className="flex flex-col space-y-4">

      {username && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "flex flex-1 p-3 border items-center gap-1.5 rounded-lg h-10",
              isIntermediateState && "opacity-50"
            )}>
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
        {username ?
          <Button variant="secondary" onClick={handleUnlinkGithub}
            className={cn(isIntermediateState && "opacity-50")}
          >Disconnect</Button>
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
