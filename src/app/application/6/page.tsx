import { auth } from "@/auth"
import { ApplicationFlow } from "@/components/application/6"
import { getCategories } from "@/db/category"
import { getAdminProjects, getRoundApplications } from "@/lib/actions/projects"

export const maxDuration = 120

export default async function Page() {
  const session = await auth()

  const [projects, applications, categories] = session
    ? await Promise.all([
        getAdminProjects(session.user.id, "6"),
        getRoundApplications(session.user.id, 6),
        getCategories(),
      ])
    : [[], [], []]

  const mockApplication = {
    id: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
    roundId: "6",
    project: {
      id: "1",
      name: "Mock Project",
      description: null,
      category: null,
      thumbnailUrl: null,
      bannerUrl: null,
      website: [],
      farcaster: [],
      twitter: null,
      mirror: null,
      pricingModel: null,
      pricingModelDetails: null,
      openSourceObserverSlug: null,
      addedTeamMembers: [],
      addedFunding: [],
      hasCodeRepositories: false,
      isOnChainContract: false,
      isLaunched: false,
      launchedAt: null,
      deletedAt: null,
    },
    impactStatementAnswer: [],
    projectDescriptionOptions: [],
    // Add other required properties here
  }

  const filteredCategories = categories
    .filter((category) => category.roundId === "6")
    .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <ApplicationFlow
        className="mt-18 max-w-4xl"
        projects={projects}
        // applications={applications}
        applications={[mockApplication]}
        categories={filteredCategories}
      />
    </main>
  )
}
