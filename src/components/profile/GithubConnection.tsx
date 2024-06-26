"use client"

import { User } from "@prisma/client"
import { setCookie } from "cookies-next"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import {
  connectGithub,
  removeGithub,
  setUserIsNotDeveloper,
} from "@/lib/actions/users"
import { cn, GITHUB_REDIRECT_COOKIE } from "@/lib/utils"

import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"

export function GithubConnection({ user }: { user: User }) {
  const pathname = usePathname()

  const [userNotDeveloper, setUserNotDeveloper] = useState(user.notDeveloper)
  const [loading, setLoading] = useState(false)

  const toggleIsDeveloper = async () => {
    if (loading) {
      return
    }

    setLoading(true)

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
    } finally {
      setLoading(false)
    }
  }

  const authorizeGithub = async () => {
    // Set a cookie so that we know to redirect back to this page
    setCookie(GITHUB_REDIRECT_COOKIE, pathname)
    return connectGithub()
  }

  const disconnectGitHub = async () => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      const result = await removeGithub()
      if (result.error !== null) {
        throw result.error
      }
    } catch (error) {
      console.error("Error disconnecting GitHub", error)
      toast.error("Error disconnecting GitHub")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-[6px]">
        <Image
          src="/assets/icons/githubIcon.svg"
          alt="Github"
          height={20}
          width={20}
        />
        <h3 className="text-xl font-semibold">Github</h3>
      </div>
      <p className="text-secondary-foreground">
        Connecting your GitHub account to your profile allows you to show your
        code contributions to the Optimism Collective.
        <br />
        <br />
        Doing so opens up new opportunities, such as applying to participate in
        Retro Funding 5 as a guest voter.
      </p>

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

            <Button variant="secondary" onClick={disconnectGitHub}>
              Disconnect
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          disabled={userNotDeveloper || !!user.github}
          variant="destructive"
          onClick={authorizeGithub}
        >
          Connect Github
        </Button>

        <div
          className={cn(
            "text-sm h-10 px-3 flex gap-1.5 items-center border border-border rounded-md",
            userNotDeveloper && "bg-secondary",
          )}
        >
          <Checkbox
            checked={userNotDeveloper}
            onCheckedChange={toggleIsDeveloper}
            className="rounded-none border-[1.5px]"
          />
          I&apos;m not a developer
        </div>
      </div>
    </div>
  )
}
