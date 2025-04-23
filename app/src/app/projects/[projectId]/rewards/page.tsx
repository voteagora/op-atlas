import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { RewardsSection } from "@/components/projects/rewards/RewardsSection"
import { getProjectKycTeam } from "@/db/kyc"
import { getConsolidatedProjectTeam, getProject } from "@/db/projects"
import { verifyMembership } from "@/lib/actions/utils"
import { getProjectRecurringRewards } from "@/db/rewards"
import { formatRecurringRewards } from "@/lib/utils/rewards"

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

  const [project, team, membership, kycTeam, recurringRewards] =
    await Promise.all([
      getProject({ id: params.projectId }),
      getConsolidatedProjectTeam({ projectId: params.projectId }),
      verifyMembership(params.projectId, session?.user.farcasterId),
      getProjectKycTeam(params.projectId),
      getProjectRecurringRewards(params.projectId),
    ])

  if (membership?.error || !project) {
    redirect("/dashboard")
  }

  return (
    <RewardsSection
      team={team}
      project={project}
      kycTeam={kycTeam}
      recurringRewards={formatRecurringRewards(recurringRewards)}
    />
  )
}
