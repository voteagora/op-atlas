"use client"

import { format } from "date-fns"

import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { useUserProjects } from "@/hooks/db/useUserProjects"
import { useUserRoundApplications } from "@/hooks/db/useUserRoundApplications"
import { FundingRoundData } from "@/lib/MissionsAndRoundData"

import { ApplicationStatusCard } from "./ApplicationStatusCard"

export const UserRoundApplicationStatusCard = () => {
  const mission = useMissionFromPath()

  const { data: applications, isLoading: isLoadingApplications } =
    useUserRoundApplications(mission?.number)
  const { data: projects, isLoading: isLoadingProjects } = useUserProjects(
    mission?.number,
  )

  return (
    <>
      {!isLoadingApplications && !isLoadingProjects && (
        <div className="border-2 border-grey-900 rounded-xl flex flex-col gap-y-3 p-6">
          <ApplicationStatusCard
            applyByDate={mission?.applyBy && format(mission.applyBy, "MMM d")}
            startDate={mission?.startsAt && format(mission?.startsAt, "MMM d")}
            userProjectCount={projects?.length}
            userAppliedProjects={applications?.map((application) => {
              return {
                icon: application.project.thumbnailUrl,
                name: application.project.name,
              }
            })}
            pageName={mission?.pageName}
          />
        </div>
      )}
    </>
  )
}
