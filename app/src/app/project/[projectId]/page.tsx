import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import TrackedExtendedLink from "@/components/common/TrackedExtendedLink"
import { getUserById } from "@/db/users"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { verifyMembership } from "@/lib/actions/utils"
import { getProjectMetrics } from "@/lib/oso"
import { getProjectDeployedChains } from "@/lib/oso/utils"

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

  const [session, publicProject, projectMetrics] = await Promise.all([
    auth(),
    getPublicProjectAction({ projectId }),
    getProjectMetrics(projectId),
  ])

  if (!publicProject) {
    return notFound()
  }

  const userId = session?.user?.id

  const isMember =
    !!userId && !(await verifyMembership(projectId, userId))?.error

  const {
    eligibility,
    onchainBuilderMetrics,
    devToolingMetrics,
    performanceMetrics,
  } = projectMetrics

  const hasQualifiedAddresses = Object.values(
    onchainBuilderMetrics?.activeAddresses ?? {},
  ).some((address) => address.value > 0)

  const deployedOn = getProjectDeployedChains(publicProject.contracts)

  const deployedOnWorldchain = deployedOn.some(
    (chain) => chain.name === "Worldchain",
  )

  const author = publicProject.organization
    ? {
        avatarUrl: publicProject.organization.organization.avatarUrl,
        name: publicProject.organization.organization.name,
        farcasterHandle: "",
        id: publicProject.organization.organization.id,
      }
    : {
        avatarUrl: publicProject.team?.[0]?.user.imageUrl,
        name: publicProject.team?.[0]?.user.name,
        farcasterHandle: publicProject.team?.[0]?.user.username ?? "",
      }

  const enrolledInDevTooling =
    publicProject.applications?.filter(
      (application) => application.roundId === "7",
    ).length > 0

  const enrolledInOnchainBuilders =
    publicProject.applications?.filter(
      (application) => application.roundId === "8",
    ).length > 0

  const enrolledInMission = enrolledInDevTooling || enrolledInOnchainBuilders

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
            deployedOn={deployedOn}
            description={publicProject.description}
            socials={{
              website: publicProject.website,
              farcaster: publicProject.farcaster,
              twitter: publicProject.twitter,
              mirror: publicProject.mirror,
            }}
          />

          {!enrolledInMission && !onchainBuilderMetrics && (
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
                  {enrolledInOnchainBuilders && (
                    <li>
                      <Mission
                        type="on-chain"
                        onchainBuilderMetrics={onchainBuilderMetrics}
                        eligibility={
                          eligibility
                            ? {
                                ...eligibility,
                                hasQualifiedAddresses,
                                deployedOnWorldchain,
                              }
                            : undefined
                        }
                        isMember={isMember}
                        projectName={publicProject.name ?? ""}
                      />
                    </li>
                  )}
                  {enrolledInDevTooling && (
                    <li>
                      <Mission
                        type="dev-tooling"
                        devToolingMetrics={devToolingMetrics}
                        eligibility={eligibility}
                        isMember={isMember}
                        projectName={publicProject.name ?? ""}
                      />
                    </li>
                  )}
                </ul>
              </div>
              {enrolledInMission && (
                <div className="w-full space-y-6">
                  <div className="flex items-center space-x-2 group">
                    <h4 className="font-semibold text-xl">
                      Get ready for Superchain interop
                    </h4>
                  </div>
                  <div className="flex gap-4 lg:flex-row flex-col">
                    {enrolledInOnchainBuilders && (
                      <IncreaseYourImpact
                        type="onchain-builders"
                        projectId={projectId}
                        isMember={isMember}
                      />
                    )}
                    {enrolledInDevTooling && (
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

          {/* Only show performance metrics if the project is eligible for onchain builder and if there is performance metrics */}
          {performanceMetrics &&
            Object.values(eligibility?.onchainBuilderEligibility ?? {}).some(
              Boolean,
            ) && <Performance metrics={performanceMetrics} />}
          <MoreDetails />
        </div>
      </div>
    </div>
  )
}
