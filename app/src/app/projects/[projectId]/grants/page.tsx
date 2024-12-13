import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { GrantsForm } from "@/components/projects/grants/GrantsForm"
import { getProject } from "@/db/projects"
import { isUserMember } from "@/lib/actions/utils"

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

  return <GrantsForm project={project} />
}
