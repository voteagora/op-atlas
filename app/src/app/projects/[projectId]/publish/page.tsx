import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { PublishForm } from "@/components/projects/publish/PublishForm"
import { getProject, getProjectContracts } from "@/db/projects"
import { verifyMembership } from "@/lib/actions/utils"

export const maxDuration = 120

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()

  if (!session?.user.id) {
    redirect("/dashboard")
  }

  const [project, contracts, isMember] = await Promise.all([
    getProject({ id: params.projectId }),
    getProjectContracts({ projectId: params.projectId }),
    verifyMembership(params.projectId, session?.user.farcasterId),
  ])

  if (!isMember || !project) {
    redirect("/dashboard")
  }

  return <PublishForm project={project} contracts={contracts} />
}
