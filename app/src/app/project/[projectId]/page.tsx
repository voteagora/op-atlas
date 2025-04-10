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

  const isMember = !(
    await verifyMembership(projectId, session?.user.farcasterId ?? "")
  )?.error

  const { isOnchainBuilder, isDevTooling, projectOSOData, groupedMetrics } =
    publicProjectMetrics

  const enrolledInMission = isOnchainBuilder || isDevTooling

  const onchainBuildersMetrics = {
    ...groupedMetrics,
    opReward: Math.round(projectOSOData?.onchainBuilderReward ?? 0),
  }

  const deployedOnWorldchain = publicProject.deployedOn?.some(
    (chain) => chain.name === "Worldchain",
  )

  const author = publicProject.organization
    ? {
        avatarUrl: publicProject.organization.organization.avatarUrl,
        name: publicProject.organization.organization.name,
        farcasterHandle: "",
      }
    : {
        avatarUrl: publicProject.team?.[0]?.user.imageUrl,
        name: publicProject.team?.[0]?.user.name,
        farcasterHandle: publicProject.team?.[0]?.user.username ?? "",
      }

  const showIncreaseImpact =
    projectOSOData?.devToolingEligible || projectOSOData?.onchainBuilderEligible

  return (
    <div className="w-full h-full mt-6 pb-12">
      <div className="mx-auto w-full max-w-[1128px] px-8 space-y-12">
        <div className="w-full mt-8">
          <Header
            projectId={projectId}
            isMember={isMember}
            thumbnail={publicProject.thumbnailUrl}
            banner={publicProject.bannerUrl}
          />
        </div>

        <div className="space-y-12 px-12 pt-12">
          <Description
            projectId={projectId}
            isMember={isMember}
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

          {!enrolledInMission && !onchainBuildersMetrics && (
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
                  isContributor: isMember,
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
                        projectName={publicProject.name}
                        isMember={isMember}
                        deployedOnWorldchain={deployedOnWorldchain}
                        opReward={Math.round(
                          publicProject.onchainBuildersRewards ?? 0,
                        )}
                        metrics={{
                          activeAddresses:
                            onchainBuildersMetrics.activeAddresses,
                          gasFees: onchainBuildersMetrics.gasFees,
                          transactions: onchainBuildersMetrics.transactions,
                          tvl: onchainBuildersMetrics.tvl,
                          eligibility: {
                            hasBundleBear:
                              projectOSOData?.hasBundleBear ?? false,
                            hasDefillamaAdapter:
                              projectOSOData?.hasDefillamaAdapter ?? false,
                            hasQualifiedAddresses: Boolean(
                              onchainBuildersMetrics.activeAddresses?.length,
                            ),
                          },
                        }}
                        projectOSOData={projectOSOData}
                        applicationDate={
                          publicProject.onchainBuildersApplication?.createdAt
                        }
                      />
                    </li>
                  )}
                  {isDevTooling && (
                    <li>
                      <Mission
                        type="dev-tooling"
                        isMember={isMember}
                        projectName={publicProject.name}
                        projectOSOData={projectOSOData}
                        opReward={Math.round(
                          publicProject.devToolingRewards ?? 0,
                        )}
                        metrics={{
                          activeAddresses:
                            onchainBuildersMetrics.activeAddresses,
                          gasFees: onchainBuildersMetrics.gasFees,
                          transactions: onchainBuildersMetrics.transactions,
                          tvl: onchainBuildersMetrics.tvl,
                          eligibility: {
                            hasBundleBear:
                              projectOSOData?.hasBundleBear ?? false,
                            hasDefillamaAdapter:
                              projectOSOData?.hasDefillamaAdapter ?? false,
                            hasQualifiedAddresses: Boolean(
                              onchainBuildersMetrics.activeAddresses?.length,
                            ),
                          },
                        }}
                        applicationDate={
                          publicProject.devToolingApplication?.createdAt
                        }
                      />
                    </li>
                  )}
                </ul>
              </div>
              {showIncreaseImpact && (
                <div className="w-full space-y-6">
                  <div className="flex items-center space-x-2 group">
                    <h4 className="font-semibold text-xl">
                      Get ready for Superchain interop
                    </h4>
                  </div>
                  <div className="flex gap-4 lg:flex-row flex-col">
                    {isOnchainBuilder && (
                      <IncreaseYourImpact
                        type="onchain-builders"
                        projectId={projectId}
                        isMember={isMember}
                      />
                    )}
                    {isDevTooling && (
                      <IncreaseYourImpact
                        type="dev-tooling"
                        projectId={projectId}
                        isMember={isMember}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* {onchainBuildersMetrics && <Performance />} */}
          <MoreDetails />
        </div>
      </div>
    </div>
  )
}
