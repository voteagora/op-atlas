import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { RewardsSection } from "@/components/projects/rewards/RewardsSection"
import { getVerifiedKycTeamsMap } from "@/db/kyc"
import { getConsolidatedProjectTeam, getProject } from "@/db/projects"
import { verifyMembership } from "@/lib/actions/utils"
import { getUserById } from "@/db/users"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()

  if (!session?.user.id) {
    redirect("/login")
  }

  const user = await getUserById(session?.user.id)

  if (!user || !user?.farcasterId) {
    redirect("/dashboard")
  }

  const [project, team, membership, verifiedKycTeams] = await Promise.all([
    getProject({ id: params.projectId }),
    getConsolidatedProjectTeam({ projectId: params.projectId }),
    verifyMembership(params.projectId, user?.farcasterId),
    getVerifiedKycTeamsMap(params.projectId),
  ])

  if (membership?.error || !project) {
    redirect("/dashboard")
  }

  const inProgressRewards = project.rewards.filter(
    (reward) =>
      reward.roundId === "7" ||
      reward.roundId === "8" ||
      reward.claim?.status === "pending",
  )
  const claimedRewards = project.rewards.filter(
    (reward) => reward.claim?.status === "claimed",
  )

  return (
    <RewardsSection
      inProgressRewards={inProgressRewards}
      claimedRewards={claimedRewards}
      team={team}
      verifiedKycTeams={verifiedKycTeams}
    />
  )
}
