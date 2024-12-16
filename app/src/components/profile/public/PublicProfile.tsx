"use client"

import { Organization } from "@prisma/client"

import { ProjectWithDetails, UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"

import ProfileHeader from "./ProfileHeader"
import ProfileOrganizations from "./ProfileOrganizations"
import ProfileProjects from "./ProfileProjects"
import ProfileRoles from "./ProfileRoles"

const PublicUserProfile = ({
  className,
  user,
  organizations,
  projects,
}: {
  className?: string
  user: UserWithAddresses
  organizations: Organization[]
  projects: ProjectWithDetails[]
}) => {
  return (
    <div className={cn("flex flex-col gap-y-6 mt-6", className)}>
      <div className="flex flex-col w-full items-start max-w-4xl mx-auto my-18">
        <ProfileHeader user={user} />
        {/* Roles */}
        <ProfileRoles user={user} />

        {/* OP Stack proximity */}

        {/* Organizations */}
        <ProfileOrganizations organizations={organizations} />
        {/* Projects */}
        <ProfileProjects projects={projects} />
      </div>
    </div>
  )
}

export default PublicUserProfile
