import { redirect } from "next/navigation"

import { ApplicationFlow } from "@/components/application/5"
import { getCategoriesWithClient } from "@/db/category"
import {
  getAdminProjects,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"
import { withImpersonation } from "@/lib/db/sessionContext"

export const maxDuration = 120

export default async function Page() {
  const { session, db, userId } = await withImpersonation()
  if (!userId) {
    redirect("/")
  }

  const [projects, applications, categories] = session
    ? await Promise.all([
        getAdminProjects(userId, "5"),
        getUserApplicationsForRound(userId, 5),
        getCategoriesWithClient(db),
      ])
    : [[], [], []]

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <ApplicationFlow
        className="mt-18 max-w-4xl"
        projects={projects}
        applications={applications}
        categories={categories}
      />
    </main>
  )
}
