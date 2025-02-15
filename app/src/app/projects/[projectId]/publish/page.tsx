import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { PublishForm } from "@/components/projects/publish/PublishForm"
import { getProject, getProjectContracts } from "@/db/projects"
import { isUserMember } from "@/lib/actions/utils"

export const maxDuration = 120

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const [session, project, contracts] = await Promise.all([
    auth(),
    getProject({ id: params.projectId }),
    getProjectContracts({ projectId: params.projectId }),
  ])

  if (!project || !isUserMember(project, session?.user.id)) {
    redirect("/dashboard")
  }

  return <PublishForm project={project} contracts={contracts} />
}
