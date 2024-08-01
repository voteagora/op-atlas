import { redirect } from "next/navigation"

import { auth } from "@/auth"
import ProjectDetailsForm from "@/components/projects/details/ProjectDetailsForm"
import { getOrganizations } from "@/db/organizations"
import { getProject } from "@/db/projects"
import { isUserMember } from "@/lib/actions/utils"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()

  if (!session?.user.id) {
    redirect("/dashboard")
  }

  const [project, userOrganizations] = await Promise.all([
    getProject({ id: params.projectId }),
    getOrganizations(session?.user.id),
  ])

  if (!project || !isUserMember(project, session?.user.id)) {
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
