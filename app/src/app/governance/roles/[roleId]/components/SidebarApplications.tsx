"use client"

import { RoleApplication } from "@prisma/client"

import { UserAvatar } from "@/components/common/UserAvatar"
import { ArrowRightS } from "@/components/icons/remix"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganization } from "@/hooks/db/useOrganization"
import { useUser } from "@/hooks/db/useUser"
import { useUsername } from "@/hooks/useUsername"

export default function SidebarApplications({
  applications,
}: {
  applications: RoleApplication[]
}) {
  return (
    <div className="w-full flex flex-col gap-6 border border-border-secondary rounded-lg p-6">
      <div className="text-secondary-foreground text-sm font-semibold">
        {applications.length} candidate{applications.length > 1 ? "s" : ""} so
        far
      </div>
      <div className="flex flex-col gap-4">
        {applications.map((application) =>
          application.userId ? (
            <UserCandidate key={application.id} application={application} />
          ) : (
            <OrgCandidate key={application.id} application={application} />
          ),
        )}
      </div>
    </div>
  )
}

const OrgCandidate = ({ application }: { application: RoleApplication }) => {
  const { data: org } = useOrganization({ id: application.organizationId! })

  if (!org) {
    return <CandidateSkeleton />
  }

  const handleClick = () => window.open(`/${org.id}`, "_blank")
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className="flex flex-row gap-2 w-full justify-between cursor-pointer "
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${org.name}`}
    >
      <div className="flex flex-row gap-2 text-sm ">
        <UserAvatar imageUrl={org.avatarUrl} size={"sm"} />
        {org.name}
      </div>
      <ArrowRightS className="w-4 h-4" />
    </div>
  )
}

const UserCandidate = ({ application }: { application: RoleApplication }) => {
  const { user } = useUser({ id: application.userId! })
  const username = useUsername(user)

  if (!user) {
    return <CandidateSkeleton />
  }

  const handleClick = () => window.open(`/${user.username}`, "_blank")
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className="flex flex-row gap-2 w-full justify-between cursor-pointer "
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View profile of ${username || user.name}`}
    >
      <div className="flex flex-row gap-2 text-sm ">
        <UserAvatar imageUrl={user.imageUrl} size={"sm"} />
        {username || user.name}
      </div>
      <ArrowRightS className="w-4 h-4" />
    </div>
  )
}

const CandidateSkeleton = () => {
  return (
    <div className="flex flex-row gap-2 w-full">
      <div className="flex flex-row gap-2 text-sm">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="w-24 h-4" />
      </div>
    </div>
  )
}
