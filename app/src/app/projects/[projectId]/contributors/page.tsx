import { Metadata } from "next"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import TeamForm from "@/components/projects/teams/TeamForm"
import {
  getConsolidatedProjectTeamWithClient,
  getProjectWithClient,
} from "@/db/projects"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { verifyMembership } from "@/lib/actions/utils"
import { getImpersonationContext } from "@/lib/db/sessionContext"

export async function generateMetadata({
  params,
}: {
  params: {
    projectId: string
  }
}): Promise<Metadata> {
  const project = await getPublicProjectAction({ projectId: params.projectId })

  const title = `Project Contributors: ${project?.name ?? ""} - OP Atlas`
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
  const { db, userId } = await getImpersonationContext()

  if (!userId) {
    redirect("/")
  }

  const membershipPromise = verifyMembership(params.projectId, userId, db)

  const [project, team, membership] = await Promise.all([
    getProjectWithClient({ id: params.projectId }, db),
    getConsolidatedProjectTeamWithClient({ projectId: params.projectId }, db),
    membershipPromise,
  ])

  if (!project || membership?.error) {
    redirect("/dashboard")
  }

  return <TeamForm project={project} team={team} />
}
