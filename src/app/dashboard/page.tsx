import { redirect } from "next/navigation"

import { auth } from "@/auth"
import Dashboard from "@/components/dashboard"
import { getUserByFarcasterId } from "@/db/users"
import { getApplications, getProjects } from "@/lib/actions/projects"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const user = await getUserByFarcasterId(session.user.farcasterId)
  if (!user) {
    redirect("/")
  }

  const [projects, applications] = await Promise.all([
    getProjects(session.user.farcasterId),
    getApplications(session.user.farcasterId),
  ])

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <Dashboard
        user={user}
        projects={projects}
        applications={applications}
        className="mt-18 max-w-4xl"
      />
    </main>
  )
}
