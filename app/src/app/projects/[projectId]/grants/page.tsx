import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { GrantsForm } from "@/components/projects/grants/GrantsForm"
import { getProject } from "@/db/projects"
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

  const [project, membership] = await Promise.all([
    getProject({ id: params.projectId }),
    verifyMembership(params.projectId, userId),
  ])

  if (membership?.error || !project) {
    redirect("/dashboard")
  }

  return <GrantsForm project={project} />
}
