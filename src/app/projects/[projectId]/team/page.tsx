import { redirect } from "next/navigation"

import TeamForm from "@/components/projects/teams/TeamForm"
import { getProject } from "@/db/projects"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const project = await getProject({ id: params.projectId })

  if (!project) {
    redirect("/dashboard")
  }

  return <TeamForm project={project} />
}
