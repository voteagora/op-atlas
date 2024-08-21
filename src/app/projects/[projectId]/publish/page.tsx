import { redirect } from "next/navigation"

import { getProject } from "@/app/api/db/projects"
import { auth } from "@/auth"
import { PublishForm } from "@/components/projects/publish/PublishForm"
import { isUserMember } from "@/lib/actions/utils"

export const maxDuration = 120

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()
  const project = await getProject({ id: params.projectId })

  if (!project || !isUserMember(project, session?.user.id)) {
    redirect("/dashboard")
  }

  return <PublishForm project={project} />
}
