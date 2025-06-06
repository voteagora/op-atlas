import { redirect } from "next/navigation"

import { auth } from "@/auth"
import TeamForm from "@/components/projects/teams/TeamForm"
import { getConsolidatedProjectTeam, getProject } from "@/db/projects"
import { verifyMembership } from "@/lib/actions/utils"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    redirect("/")
  }

  const [project, team, membership] = await Promise.all([
    getProject({ id: params.projectId }),
    getConsolidatedProjectTeam({ projectId: params.projectId }),
    verifyMembership(params.projectId, userId),
  ])

  if (membership?.error || !project) {
    redirect("/dashboard")
  }

  return <TeamForm project={project} team={team} />
}
