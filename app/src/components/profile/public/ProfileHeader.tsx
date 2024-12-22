import React, { memo } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GithubUserData, UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"

import ProfileHeaderLinks from "./ProfileHeaderLinks"

const ProfileHeader = ({
  className,
  user,
  githubUserData,
}: {
  className?: string
  user: UserWithAddresses
  githubUserData?: GithubUserData
}) => {
  const initials = (user?.name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className={cn("flex gap-x-4", className)}>
      <div className="flex flex-col">
        <Avatar className="w-28 h-28 mb-4">
          <AvatarImage src={user?.imageUrl ?? ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col pt-4">
          <h2 className="flex items-center gap-x-2">{user.name ?? ""} </h2>
          <span className="pt-4">{user.bio}</span>
        </div>

        <ProfileHeaderLinks
          user={user}
          githubFollowerCount={githubUserData?.followers}
        />
      </div>
    </div>
  )
}

export default memo(ProfileHeader)
