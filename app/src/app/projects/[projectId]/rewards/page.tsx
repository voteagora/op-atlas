import { Metadata } from "next"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import { RewardsSection } from "@/components/projects/rewards/RewardsSection"
import { getConsolidatedProjectTeam, getProject } from "@/db/projects"
import { getProjectRecurringRewards } from "@/db/rewards"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { verifyMembership } from "@/lib/actions/utils"
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
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    redirect("/")
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
