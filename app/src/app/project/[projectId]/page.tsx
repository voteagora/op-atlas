import { notFound } from "next/navigation"

import { auth } from "@/auth"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { verifyMembership } from "@/lib/actions/utils"
import { getProjectMetrics } from "@/lib/oso"

import ProjectProfile from "./components/ProjectProfile"

interface PageProps {
  params: {
    projectId: string
  }
}

export default async function Page({ params }: PageProps) {
  const { projectId } = params

  const [session, publicProject, projectMetrics] = await Promise.all([
    auth(),
    getPublicProjectAction({ projectId }),
    getProjectMetrics(projectId),
  ])

  if (!publicProject) {
    return notFound()
  }

  const isMember = !(
    await verifyMembership(projectId, session?.user.farcasterId ?? "")
  )?.error

  return (
    <ProjectProfile
      publicProject={publicProject}
      projectMetrics={projectMetrics}
      isMember={isMember}
    />
  )
}
