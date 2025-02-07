import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { ContractsForm3 } from "@/components/projects/contracts/ContractsForm3"
import { ContractsForm2 } from "@/components/projects/contracts/ContractsForm2"
import { getProject } from "@/db/projects"
import { isUserMember } from "@/lib/actions/utils"

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
