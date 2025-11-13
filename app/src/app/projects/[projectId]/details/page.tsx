import { Metadata } from "next"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import ProjectDetailsForm from "@/components/projects/details/ProjectDetailsForm"
import { getAdminOrganizationsWithClient } from "@/db/organizations"
import { getProjectWithClient } from "@/db/projects"
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

  const title = `Project Details: ${project?.name ?? ""} - OP Atlas`
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

  const [project, userOrganizations, membership] = await Promise.all([
    getProjectWithClient({ id: params.projectId }, db),
    getAdminOrganizationsWithClient(userId, db),
    membershipPromise,
  ])

  if (!project || (!impersonating && membership?.error)) {
    redirect("/dashboard")
  }

  return (
    <ProjectDetailsForm
      project={project}
      organizations={
        userOrganizations?.organizations.map((org) => org.organization) ?? []
      }
    />
  )
}
