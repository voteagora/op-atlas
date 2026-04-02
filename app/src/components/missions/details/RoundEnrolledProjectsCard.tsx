"use client"

import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { useRoundApplications } from "@/hooks/db/useRoundApplications"

import { IconList } from "./EnrolledProjectsCard"

export const RoundEnrolledProjectsCard = () => {
  const round = useMissionFromPath()

  const { data: roundApplicationsForMission, isLoading } = useRoundApplications(
    round?.number,
  )

  const icons: (string | null)[] =
    roundApplicationsForMission?.map((project) => {
      return project.thumbnailUrl
    }) || []

  return (
    <>
      {!isLoading && icons.length > 0 && (
        <div className="border border-grey-900 rounded-xl">
          <IconList
            icons={icons}
            headerContent={
              <p className="font-normal">{icons.length} projects enrolled</p>
            }
          />
        </div>
      )}
    </>
  )
}
