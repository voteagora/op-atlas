import { QueryClient } from "@tanstack/react-query"
import { EyeOff } from "lucide-react"
import { notFound } from "next/navigation"

import { getPublicProjectOSOData } from "@/app/api/oso/common"
import { auth } from "@/auth"
import ExtendedLink from "@/components/common/ExtendedLink"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { verifyMembership } from "@/lib/actions/utils"
import { cn } from "@/lib/utils"

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

  const author = {
    avatarUrl: publicProject.team?.at(0)?.user.imageUrl,
    name: publicProject.team?.at(0)?.user.name,
    farcasterHandle: publicProject.team?.at(0)?.user.username ?? "",
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
        session?.user.farcasterId ?? "",
      )

      return {
        // TODO: Fix this type
        isOnchainBuilder,
        isDevTooling,
        isMember: !Boolean(isMember?.error),
        onchainBuildersMetrics: groupedMetrics as any,
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

  return (
    <div className="w-full h-full mt-6 pb-12">
      <div className="mx-auto w-full max-w-[1064px] px-8 space-y-12">
        <div className="w-full mt-8">
          <Header
            projectId={projectId}
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
            deployedOn={publicProject.deployedOn}
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
                        isMember={publicProjectMetrics.isMember}
                        deployedOnWorldchain={Boolean(
                          publicProject.deployedOn.find(
                            (chain) => chain.name === "Worldchain",
                          ),
                        )}
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
                        projectOSOData={projectOSOData}
                      />
                    </li>
                  )}
                  {isDevTooling && (
                    <li>
                      <Mission
                        type="dev-tooling"
                        isMember={publicProjectMetrics.isMember}
                        projectName={publicProject.name}
                        onchainBuildersMetrics={onchainBuildersMetrics}
                        projectOSOData={projectOSOData}
                      />
                    </li>
                  )}
                </ul>
              </div>
              {publicProjectMetrics.isMember && (
                <div className="w-full space-y-6">
                  <div className="flex items-center space-x-2 group">
                    <h4 className="font-semibold text-xl">
                      Increase your impact
                    </h4>
                    <button>
                      <EyeOff
                        size={20}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-150"
                      />
                    </button>
                  </div>
                  <div
                    className={cn([
                      "gap-4 grid",
                      {
                        "grid-cols-2": isOnchainBuilder && isDevTooling,
                        "grid-cols-1": isOnchainBuilder || isDevTooling,
                      },
                    ])}
                  >
                    {isOnchainBuilder && (
                      <IncreaseYourImpact type="onchain-builders" />
                    )}
                    {isDevTooling && <IncreaseYourImpact type="dev-tooling" />}
                  </div>
                </div>
              )}
            </>
          )}
          {/* TODO: Bring this back later */}
          {/* {onOnchainPerformanceData && <Performance />} */}
        </div>
      </div>
    </div>
  )
}
