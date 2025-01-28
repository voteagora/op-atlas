"use client"

import { User } from "@prisma/client"
import { setCookie } from "cookies-next"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import {
  connectGithub,
  removeGithub,
  setUserIsNotDeveloper,
} from "@/lib/actions/users"
import { cn, GITHUB_REDIRECT_COOKIE } from "@/lib/utils"

import { Checkbox } from "../ui/checkbox"

export function GithubConnection({ user }: { user: User }) {
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

  const authorizeGithub = async () => {
    // Set a cookie so that we know to redirect back to this page
    setCookie(GITHUB_REDIRECT_COOKIE, pathname)
    return connectGithub()
  }

  const disconnectGitHub = async () => {
    startTransition(async () => {
      try {
        const result = await removeGithub()
        if (result.error !== null) {
          throw result.error
        }
      } catch (error) {
        console.error("Error disconnecting GitHub", error)
        toast.error("Error disconnecting GitHub")
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

      {user.github && (
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

              <p className="text-sm">{user.github}</p>
            </div>

            <Button
              variant="secondary"
              onClick={disconnectGitHub}
              disabled={isPending}
            >
              Disconnect
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          disabled={userNotDeveloper || !!user.github}
          onClick={authorizeGithub}
        >
          Connect
        </Button>

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
