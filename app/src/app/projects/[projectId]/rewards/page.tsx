import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { RewardsSection } from "@/components/projects/rewards/RewardsSection"
import { getConsolidatedProjectTeam, getProject } from "@/db/projects"
import { getProjectRecurringRewards } from "@/db/rewards"
import { verifyMembership } from "@/lib/actions/utils"
import { formatRecurringRewards } from "@/lib/utils/rewards"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    redirect("/login")
  }

  const [project, team, membership, recurringRewards] = await Promise.all([
    getProject({ id: params.projectId }),
    getConsolidatedProjectTeam({ projectId: params.projectId }),
    verifyMembership(params.projectId, userId),
    getProjectRecurringRewards(params.projectId),
  ])

  if (membership?.error || !project) {
    redirect("/dashboard")
  }

  return (
    <RewardsSection
      team={team}
      project={project}
      recurringRewards={formatRecurringRewards(recurringRewards)}
    />
  )
}
