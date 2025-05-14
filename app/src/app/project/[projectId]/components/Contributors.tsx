"use client"

import { User } from "@prisma/client"
import { User as UserIcon } from "lucide-react"
import { ChevronDown } from "lucide-react"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserAvatarSmall } from "@/components/common/UserAvatarSmall"

interface ContributorsProps {
  contributors?: User[]
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
        {loadedContributors.map((contributor) => (
          <div key={contributor.name} className="flex items-center space-x-4">
            <UserAvatarSmall imageUrl={contributor.imageUrl} />
            <span className="font-normal text-foreground">
              {contributor.name}
            </span>
          </div>
        ))}
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
