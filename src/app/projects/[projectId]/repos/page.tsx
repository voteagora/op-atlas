import { redirect } from "next/navigation"

import { ReposForm } from "@/components/projects/repos/ReposForm"
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

  return <ReposForm project={project} />
}
