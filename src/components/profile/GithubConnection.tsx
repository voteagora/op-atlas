"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"

import { Button } from "../ui/button"

export function GithubConnection() {
  // TODO: read from user.isDeveloper
  const [isDeveloper, setIsDeveloper] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-[6px]">
        <Image
          src="/assets/icons/githubIcon.svg"
          alt="Github"
          height={20}
          width={20}
        />
        <div className="text-xl font-semibold text-foreground">Github</div>
      </div>
      <div>
        Connecting your GitHub account to your profile allows you to show your
        code contributions to the Optimism Collective. <br />
        <br />
        Doing so opens up new opportunities, such as applying to participate in
        Retro Funding 5 as a guest voter.
      </div>
      <div className="flex gap-2">
        <Button disabled={!isDeveloper} variant="destructive">
          Connect Github
        </Button>
        <div
          className={cn(
            "text-sm font-medium self-start text-foreground px-3 py-[10px] flex gap-1 items-center border border-border rounded-md",
            !isDeveloper && "bg-secondary",
          )}
        >
          <input
            type="checkbox"
            checked={!isDeveloper}
            onChange={(e) => setIsDeveloper(!e.target.checked)}
          />
          I&apos;m not a developer
        </div>
      </div>
    </div>
  )
}
