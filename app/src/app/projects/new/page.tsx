import { redirect } from "next/navigation"

import { FeedbackButton } from "@/components/common/FeedbackButton"
import ProjectDetailsForm from "@/components/projects/details/ProjectDetailsForm"
import { ProjectStatusSidebar } from "@/components/projects/ProjectStatusSidebar"
import { getAdminOrganizationsWithClient } from "@/db/organizations"
import { getUserProjectsWithClient } from "@/db/projects"
import { getImpersonationContext } from "@/lib/db/sessionContext"

export const maxDuration = 60
export const metadata = {
  title: "Projects: New - OP Atlas",
  description:
    "Sign up on OP Atlas to vote for Citizen's House proposals, Retro Funding, and more.",
}

export default async function Page() {
  const { db, userId } = await getImpersonationContext()
  if (!userId) {
    redirect("/")
  }

  const [userOrganizations, userProjects] = await Promise.all([
    getAdminOrganizationsWithClient(userId, db),
    getUserProjectsWithClient({ userId }, db),
  ])

  const switcherProjects =
    userProjects?.projects?.map((p) => ({
      id: p.project.id,
      name: p.project.name,
    })) ?? []
  const switcherOrganizations =
    userOrganizations?.organizations.map((org) => ({
      id: org.organization.id,
      name: org.organization.name,
    })) ?? []

  return (
    <div className="h-full bg-secondary flex flex-1 px-6">
      <div className="fixed bottom-4 left-4">
        <FeedbackButton />
      </div>
      <div className="flex items-start w-full max-w-6xl mx-auto my-18 gap-x-10">
        <ProjectStatusSidebar
          project={null}
          team={[]}
          contracts={null}
          switcherProjects={switcherProjects}
          switcherOrganizations={switcherOrganizations}
        />
        <div className="card flex-1">
          <ProjectDetailsForm
            organizations={
              userOrganizations?.organizations.map((org) => org.organization) ??
              []
            }
          />
        </div>
      </div>
    </div>
  )
}
