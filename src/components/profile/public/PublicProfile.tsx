"use client"

import { Organization } from "@prisma/client"

import { UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"

import ProfileHeader from "./ProfileHeader"
import ProfileOrganizations from "./ProfileOrganizations"

const PublicUserProfile = ({
  className,
  user,
  organizations,
}: {
  className?: string
  user: UserWithAddresses
  organizations: Organization[]
}) => {
  return (
    <div className={cn("flex flex-col gap-y-6 mt-6", className)}>
      <div className="flex flex-col w-full items-start max-w-4xl mx-auto my-18">
        <ProfileHeader user={user} />
        {/* Roles */}

        {/* OP Stack proximity */}

        {/* Organizations */}
        <ProfileOrganizations organizations={organizations} />
        {/* Projects */}
      </div>
    </div>
  )
}

export default PublicUserProfile
