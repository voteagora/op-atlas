import { redirect } from "next/navigation"
import { GrantsForm } from "@/components/projects/grants/GrantsForm"
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

  return <GrantsForm project={project} />
}
