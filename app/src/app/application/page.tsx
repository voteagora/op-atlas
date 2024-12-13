import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { ApplicationFlow } from "@/components/application"
import { getApplications, getProjects } from "@/lib/actions/projects"

export const maxDuration = 120

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const [projects, applications] = await Promise.all([
    getProjects(session.user.id),
    getApplications(session.user.id),
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
