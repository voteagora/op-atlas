"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import React from "react"

import { UserAvatar } from "@/components/common/UserAvatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Contributor = {
  imageUrl?: string | null
  name?: string | null
  username?: string | null
  id?: string
}

interface ContributorsProps {
  contributors?: Contributor[]
}

export default function Contributors({ contributors }: ContributorsProps) {
  const [loadedContributors, setLoadedContributors] = React.useState(
    contributors?.slice(0, 12) ?? [],
  )

  if (!contributors?.length) {
    return null
  }

  const loadMoreCount =
    contributors.length - loadedContributors.length >= 12
      ? 12
      : contributors.length - loadedContributors.length

  return (
    <div className="w-full space-y-6">
      <h4 className="font-semibold text-xl">Contributors</h4>
      <div className="pl-6 w-full grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
        {loadedContributors.map((contributor, index) => {
          const profileHref = `/${contributor.username || contributor.id || ""}`
          return (
            <Tooltip key={`${contributor.name}-${index}`}>
              <TooltipTrigger asChild>
                <Link
                  href={profileHref}
                  target="_blank"
                  className="flex items-center space-x-4 hover:underline"
                >
                  <UserAvatar imageUrl={contributor.imageUrl || undefined} size={"sm"} />
                  <span className="font-normal text-foreground truncate max-w-[200px]">
                    {contributor.name}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>{contributor.name}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>
      {loadedContributors.length >= contributors.length ? null : (
        <button
          className="flex items-center space-x-2 text-secondary-foreground font-medium text-sm"
          onClick={() => {
            setLoadedContributors(
              contributors.slice(0, loadedContributors.length + loadMoreCount),
            )
          }}
        >
          <span>Load {loadMoreCount} more</span>
          <ChevronDown size={24} />
        </button>
      )}
    </div>
  )
}
