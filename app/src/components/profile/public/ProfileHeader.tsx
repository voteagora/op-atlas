import Image from "next/image"
import React, { memo } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { isBadgeholderAddress } from "@/lib/badgeholders"
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

  const isBadgeholder = user.addresses?.find(({ address }) =>
    isBadgeholderAddress(address),
  )

  return (
    <div className={cn("flex gap-x-4", className)}>
      <div className="flex flex-col">
        <Avatar className="w-20 h-20 mb-4">
          <AvatarImage src={user?.imageUrl ?? ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <h2 className="flex items-center gap-x-2">
            {user.name ?? ""}{" "}
            {isBadgeholder && (
              <Image
                src="/assets/icons/badgeholder-sunny.png"
                width={14}
                height={14}
                alt="Badgeholder checkmark"
              />
            )}
          </h2>
          {user.bio && <p>{user.bio}</p>}
        </div>

        <ProfileHeaderLinks user={user} />
      </div>
    </div>
  )
}

export default memo(ProfileHeader)
