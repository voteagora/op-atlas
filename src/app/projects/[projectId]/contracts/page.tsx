import { redirect } from "next/navigation"
import { getProject } from "@/db/projects"
import { ContractsForm } from "@/components/projects/contracts/ContractsForm"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const project = await getProject({ id: params.projectId })

  if (!project) {
    redirect("/dashboard")
  }

  return <ContractsForm project={project} />
}
