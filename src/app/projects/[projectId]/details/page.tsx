import { redirect } from "next/navigation"
import { auth } from "@/auth"
import ProjectDetailsForm from "@/components/projects/details/ProjectDetailsForm"
import { getProject } from "@/db/projects"
import { getUserByFarcasterId } from "@/db/users"

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
    getProject({ id: params.projectId }),
  ])

  if (!user || !project) {
    redirect("/dashboard")
  }

  // Validate that the current user is part of the project
  if (!project.team.some((member) => member.userId === user.id)) {
    redirect("/dashboard")
  }

  return <ProjectDetailsForm project={project} />
}
