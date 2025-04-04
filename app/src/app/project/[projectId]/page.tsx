import { EyeOff } from "lucide-react"
import { notFound } from "next/navigation"

import { getPublicProjectOSOData } from "@/app/api/oso/common"
import { auth } from "@/auth"
import TrackedExtendedLink from "@/components/common/TrackedExtendedLink"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { verifyMembership } from "@/lib/actions/utils"
import { cn } from "@/lib/utils"

import {
  Description,
  Header,
  IncreaseYourImpact,
  Mission,
  MoreDetails,
  Performance,
} from "./components"

interface PageProps {
  params: {
    projectId: string
  }
}

export default async function Page({ params }: PageProps) {
  const { projectId } = params

  const [session, publicProject, publicProjectMetrics] = await Promise.all([
    auth(),
    getPublicProjectAction({ projectId }),
    getPublicProjectOSOData(projectId),
  ])
  if (!publicProject || publicProjectMetrics.error) {
    return notFound()
  }
  const author = publicProject.organization
    ? {
        avatarUrl: publicProject.organization.organization.avatarUrl,
        name: publicProject.organization.organization.name,
        farcasterHandle: "",
      }
    : {
        avatarUrl: publicProject.team?.at(0)?.user.imageUrl,
        name: publicProject.team?.at(0)?.user.name,
        farcasterHandle: publicProject.team?.at(0)?.user.username ?? "",
      }
  const onchainBuildersMetrics = {
    ...publicProjectMetrics.groupedMetrics,
    opReward: Math.round(
      (publicProjectMetrics.projectOSOData?.data as any)?.opReward ?? 0,
    ),
  } as any

  const isMember = await verifyMembership(
    params.projectId,
    session?.user.farcasterId ?? "",
  )

  const { isOnchainBuilder, isDevTooling, projectOSOData } =
    publicProjectMetrics

  const enrolledInMission = isOnchainBuilder || isDevTooling
  const onOnchainPerformanceData = Boolean(onchainBuildersMetrics)
  return (
    <div className="w-full h-full mt-6 pb-12">
      <div className="mx-auto w-full max-w-[1128px] px-8 space-y-12">
        <div className="w-full mt-8">
          <Header
            projectId={projectId}
            isMember={!isMember?.error}
            thumbnail={publicProject.thumbnailUrl}
            banner={publicProject.bannerUrl}
          />
        </div>
        <div className="space-y-12 px-12 pt-12">
          <Description
            projectId={projectId}
            isMember={!isMember?.error}
            name={publicProject.name}
            tags={["Project", publicProject.category ?? ""]}
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
              <TrackedExtendedLink
                href="/round/results?rounds=7,8"
                as="button"
                variant="primary"
                text="View recipients"
                eventName="Link Click"
                eventData={{
                  projectId,
                  source: "project_page",
                  isContributor: !isMember?.error,
                  linkName: "View recipients",
                }}
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
                        isMember={!isMember?.error}
                        deployedOnWorldchain={Boolean(
                          publicProject.deployedOn.find(
                            (chain) => chain.name === "Worldchain",
                          ),
                        )}
                        onchainBuildersMetrics={{
                          ...onchainBuildersMetrics,
                          eligibility: {
                            onchainBuilderEligible: (
                              projectOSOData?.data as any
                            )?.onchainBuilderEligible,
                            hasDefillamaAdapter:
                              (projectOSOData?.data as any)
                                ?.hasDefillamaAdapter ?? false,
                            hasQualifiedAddresses: Boolean(
                              onchainBuildersMetrics.activeAddresses.length ??
                                false,
                            ),
                            hasBundleBear:
                              (projectOSOData?.data as any)?.hasBundleBear ??
                              false,
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
                        isMember={!isMember?.error}
                        projectName={publicProject.name}
                        onchainBuildersMetrics={onchainBuildersMetrics}
                        projectOSOData={projectOSOData}
                      />
                    </li>
                  )}
                </ul>
              </div>
              {((projectOSOData?.data as any)?.devToolingEligible ||
                (projectOSOData?.data as any)?.onchainBuilderEligible) &&
                !isMember?.error && (
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
                        <IncreaseYourImpact
                          type="onchain-builders"
                          projectId={projectId}
                          isMember={!isMember?.error}
                        />
                      )}
                      {isDevTooling && (
                        <IncreaseYourImpact
                          type="dev-tooling"
                          projectId={projectId}
                          isMember={!isMember?.error}
                        />
                      )}
                    </div>
                  </div>
                )}
            </>
          )}
          {/* TODO: Bring this back later */}
          {/* {onOnchainPerformanceData && <Performance />} */}
          <MoreDetails />
        </div>
      </div>
    </div>
  )
}
