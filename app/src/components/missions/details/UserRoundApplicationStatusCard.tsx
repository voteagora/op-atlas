"use client"

import { format } from "date-fns"
import { ApplicationStatusCard } from "./ApplicationStatusCard"
import { FundingRound } from "@/lib/mocks"
import { useUserRoundApplications } from "@/hooks/useUserRoundApplications"
import { useUserProjects } from "@/hooks/useUserProjects"

export const UserRoundApplicationStatusCard = ({
  round,
}: {
  round: FundingRound
}) => {
  const { data: applications, isLoading: isLoadingApplications } =
    useUserRoundApplications(round?.number)
  const { data: projects, isLoading: isLoadingProjects } = useUserProjects(
    round?.number,
  )

  return (
    <>
      {!isLoadingApplications && !isLoadingProjects && (
        <div className="border-2 border-grey-900 rounded-xl">
          <ApplicationStatusCard
            applyByDate={round?.applyBy && format(round.applyBy, "MMM d")}
            startDate={round?.startsAt && format(round?.startsAt, "MMM d")}
            userProjectCount={projects?.length}
            userAppliedProjects={applications?.map((application) => {
              return {
                icon: application.project.thumbnailUrl,
                name: application.project.name,
              }
            })}
            pageName={round?.pageName}
          />
        </div>
      )}
    </>
  )
}
