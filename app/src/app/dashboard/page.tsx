import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { FeedbackButton } from "@/components/common/FeedbackButton"
import Dashboard from "@/components/dashboard"
import { getUserById } from "@/db/users"
import { getUserOrganizations } from "@/lib/actions/organizations"
import {
  getAdminProjects,
  getApplications,
  getProjects,
} from "@/lib/actions/projects"
import { GovCandidateCallout } from "@/components/dashboard/Callouts"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const [user, projects, applications, organizations, adminProjects] =
    await Promise.all([
      getUserById(session.user.id),
      getProjects(session.user.id),
      getApplications(session.user.id),
      getUserOrganizations(session.user.id),
      getAdminProjects(session.user.id),
    ])

  if (!user) {
    redirect("/")
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <GovCandidateCallout />
      <Dashboard
        user={user}
        projects={projects}
        applications={applications}
        organizations={organizations}
        adminProjects={adminProjects}
        className="w-full max-w-4xl"
      />
      <div className="fixed bottom-4 left-4">
        <FeedbackButton />
      </div>
    </main>
  )
}
