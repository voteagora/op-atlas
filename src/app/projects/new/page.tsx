import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { FeedbackButton } from "@/components/common/FeedbackButton"
import ProjectDetailsForm from "@/components/projects/details/ProjectDetailsForm"
import { ProjectStatusSidebar } from "@/components/projects/ProjectStatusSidebar"
import { getOrganizations } from "@/db/organizations"

export const maxDuration = 60

export default async function Page() {
  const session = await auth()

  if (!session?.user.id) {
    redirect("/dashboard")
  }

  const userOrganizations = await getOrganizations(session?.user.id)

  return (
    <div className="h-full bg-secondary flex flex-1 px-6">
      <div className="fixed bottom-4 left-4">
        <FeedbackButton />
      </div>
      <div className="flex items-start w-full max-w-6xl mx-auto my-18 gap-x-10">
        <ProjectStatusSidebar />
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
