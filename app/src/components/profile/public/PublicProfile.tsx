"use client"

import { Organization } from "@prisma/client"

import { ProjectWithDetailsLite, UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"

import ProfileGithubProximity from "./ProfileGithubProximity"
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
  projects: ProjectWithDetailsLite[]
}) => {


  return (
    <div
      className={cn(
        "flex flex-col gap-y-6 mt-6 w-full overflow-x-hidden",
        className,
      )}
    >
      <div className="flex flex-col w-full items-start lg:max-w-3xl lg:mx-auto my-18 lg:px-0 px-6 space-y-12">
        <ProfileHeader user={user} />
        {/* Roles */}
        <ProfileRoles user={user} />

        {/* OP Stack proximity */}
        <ProfileGithubProximity user={user} />

        {/* Organizations */}
        <ProfileOrganizations organizations={organizations} />
        {/* Projects */}
        <ProfileProjects projects={projects} />
      </div>
    </div>
  )
}

export default PublicUserProfile
