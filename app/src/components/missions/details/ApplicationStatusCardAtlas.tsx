"use client"

import { useRouter } from "next/navigation"
import { Button } from "../../ui/button"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { format } from "date-fns"
import { GreenBadge } from "../common/badges/GreenBadge"
import { Account } from "@/components/common/Account"
import { useEffect, useState } from "react"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"
import {
  getProjects,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"
import { ApplicationStatusCard } from "./ApplicationStatusCard"
import { FUNDING_ROUNDS } from "@/lib/mocks"
import { useUserRoundApplications } from "@/hooks/useUserRoundApplications"
import { useUserProjects } from "@/hooks/useUserProjects"

export const ApplicationStatusCardAtlas = ({
  pageName,
}: {
  pageName?: string
}) => {
  const foundRound = FUNDING_ROUNDS.find((round) => round.pageName === pageName)

  const { data: applications } = useUserRoundApplications(foundRound?.number)
  const { data: projects } = useUserProjects(foundRound?.number)

  return (
    <ApplicationStatusCard
      applyByDate={foundRound?.applyBy && format(foundRound.applyBy, "MMM d")}
      startDate={foundRound?.startsAt && format(foundRound?.startsAt, "MMM d")}
      userProjectCount={projects?.length}
      userAppliedProjects={applications?.map((application) => {
        return {
          icon: application.project.thumbnailUrl,
          name: application.project.name,
        }
      })}
      pageName={pageName}
    />
  )
}
