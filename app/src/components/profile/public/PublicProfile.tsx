"use client"

import { Organization } from "@prisma/client"

import { ProjectWithDetailsLite, UserWithAddresses } from "@/lib/types"

import ProfileGithubProximity from "./ProfileGithubProximity"
import ProfileHeader from "./ProfileHeader"
import ProfileOrganizations from "./ProfileOrganizations"
import ProfileProjects from "./ProfileProjects"
import ProfileRoles from "./ProfileRoles"

const PublicUserProfile = ({

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
    <div className={"w-full overflow-x-hidden pb-12"}>
      <div className="w-full lg:max-w-6xl lg:mx-auto pt-12 pb-12 lg:px-0 px-6 lg:grid lg:grid-cols-3 lg:gap-x-12">

        <div className="lg:col-span-1">
          <div className="sticky top-0">
            <ProfileHeader user={user} />
            <ProfileOrganizations organizations={organizations} />
          </div>
        </div>


        <div className="lg:col-span-2 space-y-12 mt-12 lg:mt-0">
          <ProfileRoles user={user} />
          <ProfileGithubProximity user={user} />
          <ProfileProjects projects={projects} />
        </div>
      </div>
    </div>
  )
}

export default PublicUserProfile
