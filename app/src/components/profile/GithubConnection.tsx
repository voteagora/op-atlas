"use client"

import { useLinkAccount, usePrivy } from "@privy-io/react-auth"
import Image from "next/image"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/db/useUser"
import { useHandlePrivyErrors } from "@/hooks/useHandlePrivyErrors"
import { setUserIsNotDeveloper } from "@/lib/actions/users"
import { cn } from "@/lib/utils"

import { Checkbox } from "../ui/checkbox"

export const GithubConnection = ({ userId }: { userId: string }) => {
  const { user: privyUser, unlinkGithub } = usePrivy()
  const { user, invalidate: invalidateUser } = useUser({
    id: userId,
    enabled: true,
  })

  const onError = useHandlePrivyErrors()

  const username = user?.github || privyUser?.github?.username
  const isSyncing =
    user?.github?.toLowerCase() !== privyUser?.github?.username?.toLowerCase()

  const { linkGithub } = useLinkAccount({
    onSuccess: async ({ user: updatedPrivyUser, linkMethod }) => {
      if (linkMethod === "github") {
        toast.promise(
          syncPrivyUser(updatedPrivyUser).then(() => invalidateUser()),
          {
            loading: "Linking github...",
            success: "Github linked successfully",
            error: "Failed to link github",
          },
        )
      }
    },
    onError,
  })

  const handleUnlinkGithub = () => {
    if (privyUser?.github?.subject) {
      toast.promise(unlinkGithub(privyUser.github.subject), {
        loading: "Unlinking github...",
        success: (updatedPrivyUser) => {
          syncPrivyUser(updatedPrivyUser).then(() => invalidateUser())
          return "Github unlinked successfully"
        },
        error: (error) => {
          return error.message
        },
      })
    }
  }

  const toggleIsDeveloper = () => {
    const desiredState = !user?.notDeveloper

    toast.promise(setUserIsNotDeveloper(desiredState), {
      loading: "Updating developer status...",
      success: () => {
        if (desiredState && privyUser?.github?.subject) {
          handleUnlinkGithub()
        } else {
          invalidateUser()
        }
        return "Developer status updated successfully"
      },
      error: "Failed to update developer status",
    })
  }

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
            onClick={handleUnlinkGithub}
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
