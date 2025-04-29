import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { ContractsForm } from "@/components/projects/contracts/ContractsForm"
import { getProjectContracts } from "@/db/projects"
import { getUserById } from "@/db/users"
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

  const user = await getUserById(session?.user.id)

  if (!user?.farcasterId) {
    redirect("/dashboard")
  }

  const [projectContracts, membership] = await Promise.all([
    getProjectContracts({
      projectId: params.projectId,
    }),
    verifyMembership(params.projectId, user?.farcasterId),
  ])

  if (membership?.error || !projectContracts) {
    redirect("/dashboard")
  }

  return <ContractsForm project={projectContracts} />
}
