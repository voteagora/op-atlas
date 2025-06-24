"use client"

import { RoleApplication } from "@prisma/client"
import { useRouter } from "next/navigation"

import { UserAvatarSmall } from "@/components/common/UserAvatarSmall"
import { ArrowRightS } from "@/components/icons/reminx"
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
        {applications.length} candidates so far
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
  return (
    <div className="flex flex-row gap-2 w-full justify-between cursor-pointer">
      <div className="flex flex-row gap-2 text-sm">Hello</div>
    </div>
  )
}

const UserCandidate = ({ application }: { application: RoleApplication }) => {
  const { user } = useUser({ id: application.userId || undefined })
  const username = useUsername(user)
  const router = useRouter()

  if (!user) return null

  const handleClick = () => router.push(`/${user.username}`)
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
        <UserAvatarSmall imageUrl={user.imageUrl} />
        {username || user.name}
      </div>
      <ArrowRightS className="w-4 h-4" />
    </div>
  )
}
