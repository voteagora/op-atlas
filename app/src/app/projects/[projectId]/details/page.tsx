import { redirect } from "next/navigation"

import { auth } from "@/auth"
import ProjectDetailsForm from "@/components/projects/details/ProjectDetailsForm"
import { getAdminOrganizations } from "@/db/organizations"
import { getProject } from "@/db/projects"
import { getUserById } from "@/db/users"
import { verifyMembership } from "@/lib/actions/utils"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    redirect("/dashboard")
  }

  const [project, userOrganizations, membership] = await Promise.all([
    getProject({ id: params.projectId }),
    getAdminOrganizations(userId),
    verifyMembership(params.projectId, userId),
  ])

  if (membership?.error || !project) {
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
