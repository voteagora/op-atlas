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

export default async function Page() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/")
  }

  const [user, projects, applications, organizations, adminProjects] =
    await Promise.all([
      getUserById(userId),
      getProjects(userId),
      getApplications(userId),
      getUserOrganizations(userId),
      getAdminProjects(userId),
    ])

  if (!user) {
    redirect("/")
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
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
