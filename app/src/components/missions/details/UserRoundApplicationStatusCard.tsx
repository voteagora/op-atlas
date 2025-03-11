"use client"

import { useSession } from "next-auth/react"

import { useAdminProjects } from "@/hooks/db/useAdminProjects"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { useUserRoundApplications } from "@/hooks/db/useUserRoundApplications"

import { ApplicationStatusCard } from "./ApplicationStatusCard"

export const UserRoundApplicationStatusCard = ({
  userId,
}: {
  userId: string | undefined
}) => {
  const mission = useMissionFromPath()

  const { data: applications, isLoading: isLoadingApplications } =
    useUserRoundApplications(userId, mission?.number)
  const { data: projects, isLoading: isLoadingProjects } =
    useAdminProjects(userId)

  return (
    <>
      <div className="border-2 border-grey-900 rounded-xl flex flex-col gap-y-3 p-5">
        <ApplicationStatusCard
          isLoading={isLoadingApplications && isLoadingProjects}
          mission={mission!}
          userProjectCount={projects?.length}
          userAppliedProjects={applications?.map((application) => {
            return {
              icon: application.project.thumbnailUrl,
              name: application.project.name,
            }
          })}
        />
      </div>
    </>
  )
}

export const SessionRoundApplicationStatusCard = () => {
  const session = useSession()
  return <UserRoundApplicationStatusCard userId={session?.data?.user.id} />
}
