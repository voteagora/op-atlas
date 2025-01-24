"use client"

import { IconList } from "./EnrolledProjectsCard"
import { FundingRound } from "@/lib/mocks"
import { useRoundApplications } from "@/hooks/useRoundApplications"
import { useMissionFromPath } from "@/hooks/useMissionFromPath"

export const RoundEnrolledProjectsCard = () => {
  const round = useMissionFromPath()

  const { data: roundApplicationsForMission, isLoading } = useRoundApplications(
    round?.number,
  )

  const icons: (string | null)[] =
    roundApplicationsForMission?.map((application) => {
      return application.project.thumbnailUrl
    }) || []

  return (
    <>
      {!isLoading && icons.length > 0 && (
        <div className="border-2 border-grey-900 rounded-xl">
          <IconList
            icons={icons}
            headerContent={
              <p className="font-bold">{icons.length} projects enrolled</p>
            }
          />
        </div>
      )}
    </>
  )
}
