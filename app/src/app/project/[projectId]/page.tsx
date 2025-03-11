import { QueryClient } from "@tanstack/react-query"
import { notFound } from "next/navigation"

import { getPublicProjectAction } from "@/lib/actions/projects"

import {
  Contributors,
  Description,
  EnrolledInRetroFundingBanner,
  Header,
  Links,
  Missions,
  Performance,
  Repos,
} from "./components"

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

  const author = publicProject.organization
    ? {
        avatarUrl: publicProject.organization.organization.avatarUrl,
        name: publicProject.organization.organization.name,
      }
    : {
        avatarUrl: publicProject.team.at(0)?.user.imageUrl,
        name: publicProject.team.at(0)?.user.name,
      }

  return (
    <div className="w-full h-full mt-6">
      <div className="mx-auto w-full max-w-7xl px-8 space-y-12">
        <EnrolledInRetroFundingBanner />
        <Header
          thumbnail={publicProject.thumbnailUrl}
          banner={publicProject.bannerUrl}
        />
        <Description
          name={publicProject.name}
          tags={["Project", "Cross Chain"]}
          author={author}
          deployedOn={[
            { name: "Optimism", image: "/assets/chain-logos/optimism.svg" },
          ]}
          description={publicProject.description}
          socials={{
            website: publicProject.website,
            farcaster: publicProject.farcaster,
            twitter: publicProject.twitter,
            mirror: publicProject.mirror,
          }}
        />
        <Missions />
        <Performance />
        <Contributors />
        <Repos />
        <Links />
      </div>
    </div>
  )
}
