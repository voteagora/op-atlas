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
  const userId = session?.user.id

  if (!userId) {
    redirect("/dashboard")
  }

  const [projectContracts, membership] = await Promise.all([
    getProjectContracts({
      projectId: params.projectId,
    }),
    verifyMembership(params.projectId, userId),
  ])

  if (membership?.error || !projectContracts) {
    redirect("/dashboard")
  }

  return <ContractsForm project={projectContracts} />
}
