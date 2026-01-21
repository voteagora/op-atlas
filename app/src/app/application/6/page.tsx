import { redirect } from "next/navigation"

import { ApplicationFlow } from "@/components/application/6"
import { getCategoriesWithClient } from "@/db/category"
import {
  getAdminProjects,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"
import { getImpersonationContext } from "@/lib/db/sessionContext"

export const maxDuration = 120

export default async function Page() {
  const { session, db, userId } = await getImpersonationContext()
  if (!userId) {
    redirect("/")
  }

  const [projects, applications, categories] = session
    ? await Promise.all([
        getAdminProjects(userId, "6"),
        getUserApplicationsForRound(userId, 6),
        getCategoriesWithClient(db),
      ])
    : [[], [], []]

  //   categories don't have a roundId??
  const filteredCategories = categories
    .filter((category) => category.roundId === "6")
    .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <ApplicationFlow
        className="mt-18 max-w-4xl"
        projects={projects}
        applications={applications}
        categories={filteredCategories}
      />
    </main>
  )
}
