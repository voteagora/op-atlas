import { QueryClient } from "@tanstack/react-query"
import { notFound } from "next/navigation"

import { getPublicProjectAction } from "@/lib/actions/projects"

import { EnrolledInRetroFundingBanner, Header } from "./components"

interface PageProps {
  params: {
    projectId: string
  }
}

export default async function Page({ params }: PageProps) {
  const { projectId } = params

  const queryClient = new QueryClient()
  const publicProject = await queryClient.fetchQuery({
    queryKey: ["project", "public", projectId],
    queryFn: async () => {
      return await getPublicProjectAction({ projectId })
    },
  })

  if (!publicProject) {
    return notFound()
  }

  return (
    <div className="w-full h-full mt-6">
      <div className="mx-auto w-full max-w-7xl px-8 space-y-12">
        <EnrolledInRetroFundingBanner />
        <Header
          thumbnail={publicProject.thumbnailUrl}
          banner={publicProject.bannerUrl}
        />
      </div>
    </div>
  )
}
