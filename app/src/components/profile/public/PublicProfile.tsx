"use client"

import { Organization } from "@prisma/client"

import { ProjectWithDetailsLite, UserWithAddresses } from "@/lib/types"

import RoleApplication from "../../common/RoleApplication"
import ProfileGithubProximity from "./ProfileGithubProximity"
import ProfileHeader from "./ProfileHeader"
import ProfileOrganizations from "./ProfileOrganizations"
import ProfileProjects from "./ProfileProjects"
import ProfileRoles from "./ProfileRoles"

const PublicUserProfile = ({
  user,
  organizations,
  projects,
                             kycStatus,
}: {
  user: UserWithAddresses
  organizations: Organization[]
  projects: ProjectWithDetailsLite[]
  kycStatus?: string
}) => {

  return (
    <div className={"w-full overflow-x-hidden pb-12"}>
      <div className="w-full lg:max-w-6xl lg:mx-auto pt-20 pb-12 lg:px-0 px-6 lg:grid lg:grid-cols-3 lg:gap-x-12">
        <div className="lg:col-span-1 max-w-[340px] lg:h-screen lg:overflow-y-auto">
          <div className="sticky top-0 pt-4 pb-6 z-10">
            <ProfileHeader user={user} kycStatus={kycStatus} />
            <ProfileOrganizations organizations={organizations} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-12 mt-12 lg:mt-0 max-w-[712px]">
          <RoleApplication user={user} />
          <ProfileRoles user={user} />
          {projects.length > 0 && <ProfileProjects projects={projects} />}
          <ProfileGithubProximity user={user} />
        </div>
      </div>
    </div>
  )
}

export default PublicUserProfile
