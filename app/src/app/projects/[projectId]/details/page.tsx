import { redirect } from "next/navigation"

import { auth } from "@/auth"
import ProjectDetailsForm from "@/components/projects/details/ProjectDetailsForm"
import { getAdminOrganizations } from "@/db/organizations"
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
    getAdminOrganizations(session?.user.id),
  ])

  if (!project || !isUserMember(project, session?.user.id)) {
    redirect("/dashboard")
  }

  // const searchParams = new URLSearchParams(window.location.search)
  // const paramValue = searchParams.get("orgId")

  // console.log("start")
  // console.log(paramValue)
  // console.log("after")
  // const orgId = searchParams.get("orgId") // Extract orgId from query parameters

  // const selectedOrg = userOrganizations.organizations.find((org) => {
  //   return org.organization.id === router.query["orgId"]
  // })?.organization

  return (
    <ProjectDetailsForm
      project={project}
      organizations={
        userOrganizations?.organizations.map((org) => org.organization) ?? []
      }
    />
  )
}
