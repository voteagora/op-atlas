import { auth } from "@/auth"
import { ApplicationFlow } from "@/components/application/6"
import { getCategories } from "@/db/category"
import {
  getAdminProjects,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"

export const maxDuration = 120

export default async function Page() {
  const session = await auth()

  const [projects, applications, categories] = session
    ? await Promise.all([
        getAdminProjects(session.user.id, "6"),
        getUserApplicationsForRound(session.user.id, 6),
        getCategories(),
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
