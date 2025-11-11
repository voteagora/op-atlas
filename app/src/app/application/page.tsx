import { redirect } from "next/navigation"

import { ApplicationFlow } from "@/components/application"
import { getApplications, getProjects } from "@/lib/actions/projects"
import { withImpersonation } from "@/lib/db/sessionContext"

export const maxDuration = 120

export default async function Page() {
  const { userId } = await withImpersonation()
  if (!userId) {
    redirect("/")
  }

  const [projects, applications] = await Promise.all([
    getProjects(userId),
    getApplications(userId),
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
