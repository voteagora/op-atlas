"use client"

import { OrganizationWithTeamAndProjects } from "@/lib/types"
import { cn } from "@/lib/utils"

import OrganizationHeader from "./OrganizationHeader"
// import OrganizationProjects from "./OrganizationProjects"
// import OrganizationTeam from "./OrganizationTeam"

const PublicUserProfile = ({
  className,
  organization,
}: {
  className?: string
  organization: OrganizationWithTeamAndProjects
}) => {
  return (
    <div className={cn("flex flex-col gap-y-6 mt-12", className)}>
      <div className="flex flex-col w-full items-start max-w-4xl mx-auto my-18">
        <OrganizationHeader organization={organization} />

        {/* Team */}
        {/* <OrganizationTeam team={organization.team} /> */}
        {/* Projects */}
        {/* <OrganizationProjects projects={organization.projects} /> */}
      </div>
    </div>
  )
}

export default PublicUserProfile
