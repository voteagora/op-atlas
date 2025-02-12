import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { ContractsForm } from "@/components/projects/contracts/contracts-v1/ContractsForm"
import { ContractsForm3 } from "@/components/projects/contracts/contracts-v2/ContractsForm3"
import { getConsolidatedProjectTeam, getProjectContracts } from "@/db/projects"
import { isUserMemberOfProject } from "@/lib/actions/utils"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const [session, projectContracts, projectTeam] = await Promise.all([
    auth(),
    getProjectContracts({
      projectId: params.projectId,
    }),
    getConsolidatedProjectTeam({
      projectId: params.projectId,
    }),
  ])

  if (
    !projectContracts ||
    !projectTeam ||
    !isUserMemberOfProject(projectTeam, session?.user.id)
  ) {
    redirect("/dashboard")
  }

  return <ContractsForm3 project={projectContracts} />
}
