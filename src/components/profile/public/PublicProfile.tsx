"use client"

import { UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"

import ProfileHeader from "./ProfileHeader"

const PublicUserProfile = ({
  className,
  user,
}: {
  className?: string
  user: UserWithAddresses
}) => {
  return (
    <div className={cn("flex flex-col gap-y-6 mt-6", className)}>
      <div className="flex flex-col w-full items-start max-w-4xl mx-auto my-18">
        <ProfileHeader user={user} />
        {/* TODO: Add projects */}

        {/* TODO: Add organizations */}
      </div>
    </div>
  )
}

export default PublicUserProfile
