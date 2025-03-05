import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { RewardsSection } from "@/components/projects/rewards/RewardsSection"
import { getProject } from "@/db/projects"
import { verifyMembership } from "@/lib/actions/utils"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()

  if (!session?.user.id) {
    redirect("/login")
  }

  if (!session?.user.id) {
    redirect("/dashboard")
  }

  const [project, membership] = await Promise.all([
    getProject({ id: params.projectId }),
    verifyMembership(params.projectId, session?.user.farcasterId),
  ])

  if (membership?.error || !project) {
    redirect("/dashboard")
  }

  return <RewardsSection project={project} />
}
