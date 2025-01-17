import { notFound } from "next/navigation"

import React from "react"
import { FUNDING_ROUNDS } from "@/lib/mocks"
import Mission from "@/components/missions/Mission"
import { auth } from "@/auth"
import {
  getApplications,
  getApplicationsForRound,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"

export default async function MissionPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  const foundRound = FUNDING_ROUNDS.find((page) => page.pageName === params.id)
  if (foundRound === undefined) notFound()

  let applications = null
  if (session?.user) {
    applications = await getUserApplicationsForRound(
      session?.user?.id,
      foundRound.number,
    )
  }

  const roundApplications = await getApplicationsForRound(foundRound.number)

  const roundApplicationsForMission = roundApplications.map((element) => {
    return {
      icon: element.project.thumbnailUrl,
      opReward: 0,
    }
  })

  const userProjectsForSidebar =
    applications?.map((element) => {
      return {
        icon: element.project.thumbnailUrl,
        name: element.project.name,
      }
    }) || []

  console.log(applications)
  //get live project data from somewhere
  //const { units, opRewarded, projectsEnrolled} = db.getProjectData(params.id);

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      {/* Main content */}
      <Mission
        round={foundRound}
        applications={userProjectsForSidebar}
        missionApplications={roundApplicationsForMission}
      />
    </main>
  )
}
