import { QueryClient } from "@tanstack/react-query"
import { notFound } from "next/navigation"

import { getPublicProjectOSOData } from "@/app/api/oso/common"
import { auth } from "@/auth"
import ExtendedLink from "@/components/common/ExtendedLink"
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
      const {
        isOnchainBuilder,
        isDevTooling,
        groupedMetrics,
        projectOSOData,
        error,
      } = await getPublicProjectOSOData(projectId)

      if (error) {
        return {}
      }

      const isMember = await verifyMembership(
        params.projectId,
        session?.user.farcasterId,
      )

      return {
        // TODO: Fix this type
        isOnchainBuilder,
        isDevTooling,
        isMember: !Boolean(isMember?.error),
        onchainBuildersMetrics: {
          ...groupedMetrics,
          opReward: Math.round((projectOSOData?.data as any)?.opReward ?? 0),
        } as any,
        projectOSOData: projectOSOData?.data as any,
      }
    },
  })

  const {
    isOnchainBuilder,
    isDevTooling,
    onchainBuildersMetrics,
    projectOSOData,
  } = publicProjectMetrics

  const enrolledInMission = isOnchainBuilder || isDevTooling
  const onOnchainPerformanceData = Boolean(onchainBuildersMetrics)

  console.log(">>>", isOnchainBuilder, isDevTooling, enrolledInMission)

  return (
    <div className="w-full h-full mt-6 pb-12">
      <div className="mx-auto w-full max-w-[1064px] px-8 space-y-12">
        <div className="w-full mt-8">
          <Header
            isMember={publicProjectMetrics.isMember}
            thumbnail={publicProject.thumbnailUrl}
            banner={publicProject.bannerUrl}
          />
        </div>
        <div className="space-y-12 px-12 pt-12">
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
          {!enrolledInMission && !onOnchainPerformanceData && (
            <div className="w-full h-[208px] space-y-6 rounded-xl border flex flex-col justify-center items-center p-6">
              <div className="text-center">
                <p className="font-semibold text-base text-foreground">
                  More details about this project are coming soon
                </p>
                <p className="font-normal text-base text-secondary-foreground">
                  In the meantime, explore other projects that have received
                  Retro Funding
                </p>
              </div>
              <ExtendedLink
                href="/round/results?rounds=5"
                as="button"
                variant="primary"
                text="View recipients"
              />
            </div>
          )}
          {enrolledInMission && (
            <>
              <div className="w-full space-y-6">
                <h4 className="font-semibold text-xl">Missions</h4>
                <ul className="space-y-12">
                  {isOnchainBuilder && (
                    <li>
                      <Mission
                        type="on-chain"
                        onchainBuildersMetrics={{
                          ...onchainBuildersMetrics,
                          eligibility: {
                            hasDefillamaAdapter:
                              projectOSOData?.hasDefillamaAdapter ?? false,
                            hasQualifiedAddresses: Boolean(
                              onchainBuildersMetrics.activeAddresses.length ??
                                false,
                            ),
                            hasBundleBear:
                              projectOSOData?.hasBundleBear ?? false,
                          },
                        }}
                      />
                    </li>
                  )}
                  {isDevTooling && (
                    <li>
                      <Mission
                        projectName={publicProject.name}
                        type="dev-tooling"
                        onchainBuildersMetrics={onchainBuildersMetrics}
                        projectOSOData={projectOSOData}
                      />
                    </li>
                  )}
                </ul>
              </div>
              <IncreaseYourImpact />
            </>
          )}
          {onOnchainPerformanceData && <Performance />}
        </div>
      </div>
    </div>
  )
}
