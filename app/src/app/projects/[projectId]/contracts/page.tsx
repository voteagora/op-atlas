import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { ContractsForm } from "@/components/projects/contracts/ContractsForm"
import { getProject } from "@/db/projects"
import { isUserMember } from "@/lib/actions/utils"
import { ContractsForm3 } from "@/components/projects/contracts/ContractsForm3"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()
  const project = await getProject({ id: params.projectId })

  if (!project || !isUserMember(project, session?.user.id)) {
    redirect("/dashboard")
  }

  return <ContractsForm3 project={project} />
}
