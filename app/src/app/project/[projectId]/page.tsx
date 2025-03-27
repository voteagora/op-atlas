import { QueryClient } from "@tanstack/react-query"
import { notFound } from "next/navigation"

import { getPublicProjectOSOData } from "@/app/api/oso/common"
import { auth } from "@/auth"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { verifyMembership } from "@/lib/actions/utils"

import {
  Description,
  Header,
  IncreaseYourImpact,
  Mission,
  Performance,
} from "./components"

interface PageProps {
  params: {
    projectId: string
  }
}

export default async function Page({ params }: PageProps) {
  const { projectId } = params

  const session = await auth()
  if (!session?.user.farcasterId) {
    return notFound()
  }

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
        avatarUrl: publicProject.team?.at(0)?.user.imageUrl,
        name: publicProject.team?.at(0)?.user.name,
      }

  const publicProjectMetrics = await queryClient.fetchQuery({
    queryKey: ["project", "public", "metrics", projectId],
    queryFn: async () => {
      const { groupedMetrics, projectOSOData, error } =
        await getPublicProjectOSOData(projectId)

      console.log(">>> data", groupedMetrics, projectOSOData, error)

      if (error) {
        return {}
      }

      return {
        // TODO: Fix this type
        onchainBuildersMetrics: groupedMetrics as any,
        projectOSOData: projectOSOData?.data as any,
      }
    },
  })

  const isMember = await verifyMembership(
    params.projectId,
    session?.user.farcasterId,
  )

  const onchainBuildersMetrics = publicProjectMetrics.onchainBuildersMetrics
  const projectOSOData = publicProjectMetrics.projectOSOData

  return (
    <div className="w-full h-full mt-6 pb-12">
      <div className="mx-auto w-full max-w-[1064px] px-8 space-y-12">
        <div className="w-full mt-8">
          <Header
            isMember={Boolean(isMember)}
            thumbnail={publicProject.thumbnailUrl}
            banner={publicProject.bannerUrl}
          />
        </div>
        <Description
          name={publicProject.name}
          // TODO: Replace this with actual tags
          tags={[]}
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
        <div className="w-full space-y-6">
          <h4 className="font-semibold text-xl">Missions</h4>
          <ul className="space-y-12">
            <li>
              <Mission
                type="on-chain"
                onchainBuildersMetrics={{
                  ...onchainBuildersMetrics,
                  eligibility: {
                    hasDefillamaAdapter:
                      projectOSOData?.hasDefillamaAdapter ?? false,
                    hasQualifiedAddresses: Boolean(
                      onchainBuildersMetrics.activeAddresses.length ?? false,
                    ),
                    hasBundleBear: projectOSOData?.hasBundleBear ?? false,
                  },
                }}
              />
            </li>
            <li>
              <Mission
                projectName={publicProject.name}
                type="dev-tooling"
                onchainBuildersMetrics={onchainBuildersMetrics}
                projectOSOData={projectOSOData}
              />
            </li>
          </ul>
        </div>
        <IncreaseYourImpact />
        <Performance />
      </div>
    </div>
  )
}
