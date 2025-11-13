import { Metadata } from "next"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { RewardsSection } from "@/components/projects/rewards/RewardsSection"
import {
  getConsolidatedProjectTeamWithClient,
  getProjectWithClient,
} from "@/db/projects"
import { getProjectRecurringRewards } from "@/db/rewards"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { verifyMembership } from "@/lib/actions/utils"
import { getImpersonationContext } from "@/lib/db/sessionContext"
import { formatRecurringRewards } from "@/lib/utils/rewards"

export async function generateMetadata({
  params,
}: {
  params: {
    projectId: string
  }
}): Promise<Metadata> {
  const project = await getPublicProjectAction({ projectId: params.projectId })

  const title = `Project Rewards: ${project?.name ?? ""} - OP Atlas`
  const description = project?.description ?? ""
  return {
    ...sharedMetadata,
    title,
    description,
    openGraph: {
      ...sharedMetadata.openGraph,
      title,
      description,
    },
  }
}

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const { db, userId, impersonating } = await getImpersonationContext()

  if (!userId) {
    redirect("/")
  }

  const membershipPromise = impersonating
    ? Promise.resolve(null)
    : verifyMembership(params.projectId, userId, db)

  const [project, team, membership, recurringRewards] = await Promise.all([
    getProjectWithClient({ id: params.projectId }, db),
    getConsolidatedProjectTeamWithClient({ projectId: params.projectId }, db),
    membershipPromise,
    getProjectRecurringRewards(params.projectId, db),
  ])

  if (!project || (!impersonating && membership?.error)) {
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
