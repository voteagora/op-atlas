"use client"

import { Organization } from "@prisma/client"

import {
  GithubUser,
  ProjectWithDetailsLite,
  UserWithAddresses,
} from "@/lib/types"
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
  githubUser,
  projects,
}: {
  className?: string
  user: UserWithAddresses
  githubUser?: GithubUser
  organizations: Organization[]
  projects: ProjectWithDetailsLite[]
}) => {
  return (
    <div className={cn("flex flex-col gap-y-6 mt-6", className)}>
      <div className="flex flex-col w-full items-start max-w-3xl mx-auto my-18">
        <ProfileHeader user={user} githubUser={githubUser} />
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
