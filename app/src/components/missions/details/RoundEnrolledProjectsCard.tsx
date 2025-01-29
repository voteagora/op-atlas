"use client"

import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { useRoundApplications } from "@/hooks/db/useRoundApplications"
import { FundingRoundData } from "@/lib/MissionsAndRoundData"

import { IconList } from "./EnrolledProjectsCard"

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
        <div className="border-[1px] border-grey-900 rounded-xl">
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
