import { redirect } from "next/navigation"

import { getProject } from "@/app/api/db/projects"
import { auth } from "@/auth"
import { ContractsForm } from "@/components/projects/contracts/ContractsForm"
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

  return <ContractsForm project={project} />
}
