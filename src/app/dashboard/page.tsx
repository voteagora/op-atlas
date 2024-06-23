import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Callout } from "@/components/common/Callout"
import Dashboard from "@/components/dashboard"
import { BadgeholderCallout } from "@/components/dashboard/Callouts"
import { getUserById } from "@/db/users"
import { getApplications, getProjects } from "@/lib/actions/projects"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const [user, projects, applications] = await Promise.all([
    getUserById(session.user.id),
    getProjects(session.user.id),
    getApplications(session.user.id),
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
        className="max-w-4xl"
      />
    </main>
  )
}
