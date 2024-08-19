import { auth } from "@/auth"
import { ApplicationFlow } from "@/components/application/5"
import { getCategories } from "@/db/category"
import { getAdminProjects, getRoundApplications } from "@/lib/actions/projects"

export const maxDuration = 120

export default async function Page() {
  const session = await auth()

  const [projects, applications, categories] = session
    ? await Promise.all([
        getAdminProjects(session.user.id),
        getRoundApplications(session.user.id, 5),
        getCategories(),
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
