import { redirect } from "next/navigation"

import { auth } from "@/auth"
import TeamForm from "@/components/projects/teams/TeamForm"
import { getProject } from "@/db/projects"
import { isUserMember } from "@/lib/actions/utils"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()
  const project = await getProject({ id: params.projectId })

  if (!project || !(await isUserMember(project, session?.user.id))) {
    redirect("/dashboard")
  }

  return <TeamForm project={project} />
}
