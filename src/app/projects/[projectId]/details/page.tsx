import { redirect } from "next/navigation"
import ProjectDetailsForm from "@/components/projects/details/ProjectDetailsForm"
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

  return <ProjectDetailsForm project={project} />
}
