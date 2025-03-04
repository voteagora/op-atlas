import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { ContractsForm } from "@/components/projects/contracts/ContractsForm"
import { getProjectContracts } from "@/db/projects"
import { verifyMembership } from "@/lib/actions/utils"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()

  if (!session?.user.id) {
    redirect("/dashboard")
  }

  const [projectContracts, isMember] = await Promise.all([
    getProjectContracts({
      projectId: params.projectId,
    }),
    verifyMembership(params.projectId, session?.user.farcasterId),
  ])

  if (!isMember || !projectContracts) {
    redirect("/dashboard")
  }

  return <ContractsForm project={projectContracts} />
}
