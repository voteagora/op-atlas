"use client"

import { formatNumber } from "@/lib/utils"
import Image from "next/image"
import { EnrolledProjectsCard } from "./EnrolledProjectsCard"
import { useEffect, useState } from "react"
import { getApplicationsForRound } from "@/lib/actions/projects"
import { FUNDING_ROUNDS } from "@/lib/mocks"
import { useRoundApplications } from "@/hooks/useRoundApplications"
import { ApplicationWithDetails } from "@/lib/types"

export const EnrolledProjectsCardAtlas = ({
  units,
  opRewarded,
  avgOpRewardPerProject,
  pageName,
}: {
  units?: string
  opRewarded?: number
  avgOpRewardPerProject?: number
  pageName: string
}) => {
  const foundRound = FUNDING_ROUNDS.find((round) => round.pageName === pageName)
  const { data: roundApplicationsForMission } = useRoundApplications(
    foundRound?.number,
  )

  return (
    <EnrolledProjectsCard
      units={units}
      opRewarded={opRewarded}
      avgOpRewardPerProject={avgOpRewardPerProject}
      projects={roundApplicationsForMission?.map(
        (application: ApplicationWithDetails) => {
          return { icon: application.project.thumbnailUrl, opReward: 0 }
        },
      )}
    />
  )
}
