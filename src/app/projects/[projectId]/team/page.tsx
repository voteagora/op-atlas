import { redirect } from "next/navigation"
import { auth } from "@/auth"
import TeamForm from "@/components/projects/teams/TeamForm"
import { getUserByFarcasterId } from "@/db/users"
import { getProjectTeam } from "@/db/projects"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()
  if (!session) {
    redirect("/")
  }

  const [user, project] = await Promise.all([
    getUserByFarcasterId(session.user.id),
    getProjectTeam({ id: params.projectId }),
  ])

  if (!user || !project) {
    redirect("/dashboard")
  }

  // Validate that the current user is part of the project
  if (!project.team.some((member) => member.userId === user.id)) {
    redirect("/dashboard")
  }

  return <TeamForm project={project} />
}
