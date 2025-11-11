import { Metadata } from "next"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { ContractsForm } from "@/components/projects/contracts/ContractsForm"
import { getProjectContractsWithClient } from "@/db/projects"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { verifyMembership } from "@/lib/actions/utils"
import { withImpersonation } from "@/lib/db/sessionContext"

// Heavy verification flows (OSO fetch + large contract batches) can exceed the
// default execution window, so request the extended limit.
export const maxDuration = 300

export async function generateMetadata({
  params,
}: {
  params: {
    projectId: string
  }
}): Promise<Metadata> {
  const project = await getPublicProjectAction({ projectId: params.projectId })

  const title = `Project Contracts: ${project?.name ?? ""} - OP Atlas`
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
  const { db, userId, impersonating } = await withImpersonation()

  if (!userId) {
    redirect("/")
  }

  const membershipPromise = impersonating
    ? Promise.resolve(null)
    : verifyMembership(params.projectId, userId, db)

  const [projectContracts, membership] = await Promise.all([
    getProjectContractsWithClient(
      {
        projectId: params.projectId,
      },
      db,
    ),
    membershipPromise,
  ])

  if (!projectContracts || (!impersonating && membership?.error)) {
    redirect("/dashboard")
  }

  return <ContractsForm project={projectContracts} />
}
