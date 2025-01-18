import React, { memo } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"

import ProfileHeaderLinks from "./ProfileHeaderLinks"

const ProfileHeader = ({
  className,
  user,
}: {
  className?: string
  user: UserWithAddresses
}) => {
  const initials = (user?.name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className={cn("flex gap-x-4", className)}>
      <div className="flex flex-col space-y-6">
        <Avatar className="w-28 h-28">
          <AvatarImage src={user?.imageUrl ?? ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-3">
          <div>
            <h2 className="flex items-center gap-x-2">{user.name ?? ""} </h2>
            <span>{user.bio}</span>
          </div>
          <ProfileHeaderLinks user={user} />
        </div>
      </div>
    </div>
  )
}

export default memo(ProfileHeader)
