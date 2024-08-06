import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { ApplicationFlow } from "@/components/application/5"
import { getAdminProjects, getRoundApplications } from "@/lib/actions/projects"

export const maxDuration = 120

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const [projects, applications] = await Promise.all([
    getAdminProjects(session.user.id),
    getRoundApplications(session.user.id, 5),
  ])

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <ApplicationFlow
        className="mt-18 max-w-4xl"
        projects={projects}
        applications={applications}
      />
    </main>
  )
}
