import { redirect } from "next/navigation"

import { ContractsForm } from "@/components/projects/contracts/ContractsForm"
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

  return <ContractsForm project={project} />
}
