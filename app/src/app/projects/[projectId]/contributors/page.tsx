import { redirect } from "next/navigation"

import { auth } from "@/auth"
import TeamForm from "@/components/projects/teams/TeamForm"
import { getConsolidatedProjectTeam, getProject } from "@/db/projects"
import { getUserById } from "@/db/users"
import { verifyMembership } from "@/lib/actions/utils"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()

  if (!session?.user.id) {
    redirect("/dashboard")
  }

  const user = await getUserById(session?.user.id)

  if (!user?.farcasterId) {
    redirect("/dashboard")
  }

  const [project, team, membership] = await Promise.all([
    getProject({ id: params.projectId }),
    getConsolidatedProjectTeam({ projectId: params.projectId }),
    verifyMembership(params.projectId, user?.farcasterId),
  ])

  if (membership?.error || !project) {
    redirect("/dashboard")
  }

  return <TeamForm project={project} team={team} />
}
