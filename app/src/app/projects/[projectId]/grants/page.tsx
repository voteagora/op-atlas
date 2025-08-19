import { Metadata } from "next"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import { GrantsForm } from "@/components/projects/grants/GrantsForm"
import { getProject } from "@/db/projects"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { verifyMembership } from "@/lib/actions/utils"

export async function generateMetadata({
  params,
}: {
  params: {
    projectId: string
  }
}): Promise<Metadata> {
  const project = await getPublicProjectAction({ projectId: params.projectId })

  const title = `Project Grants: ${project?.name ?? ""} - OP Atlas`
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

  const [project, membership] = await Promise.all([
    getProject({ id: params.projectId }),
    verifyMembership(params.projectId, userId),
  ])

  if (membership?.error || !project) {
    redirect("/dashboard")
  }

  return <GrantsForm project={project} />
}
