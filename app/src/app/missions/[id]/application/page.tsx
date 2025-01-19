import React from "react"
import { FUNDING_ROUNDS } from "@/lib/mocks"
import { notFound } from "next/navigation"
import { getApplications, getProjects } from "@/lib/actions/projects"
import { auth } from "@/auth"
import { MissionApplication } from "@/components/missions/MissionApplication"

export default async function MissionApplicationPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  const foundRound = FUNDING_ROUNDS.find((page) => page.pageName === params.id)
  if (foundRound === undefined) notFound()

  const [projects, applications] = session
    ? await Promise.all([
        getProjects(session.user.id),
        getApplications(session.user.id),
      ])
    : [[], [], []]

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      <MissionApplication
        projects={projects}
        round={foundRound}
        applications={applications}
      />
    </main>
  )
}
