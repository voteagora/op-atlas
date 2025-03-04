import { redirect } from "next/navigation"

import { auth } from "@/auth"
import ProjectDetailsForm from "@/components/projects/details/ProjectDetailsForm"
import { getAdminOrganizations } from "@/db/organizations"
import { getProject } from "@/db/projects"
import { verifyMembership } from "@/lib/actions/utils"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()

  if (!session?.user.id) {
    redirect("/dashboard")
  }

  const [project, userOrganizations, isMember] = await Promise.all([
    getProject({ id: params.projectId }),
    getAdminOrganizations(session?.user.id),
    verifyMembership(params.projectId, session?.user.farcasterId),
  ])

  if (!isMember || !project) {
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
