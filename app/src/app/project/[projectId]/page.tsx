import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import TrackedExtendedLink from "@/components/common/TrackedExtendedLink"
import { getPublicProjectAction } from "@/lib/actions/projects"
import { verifyMembership } from "@/lib/actions/utils"
import { getProjectMetrics } from "@/lib/oso"
import { getProjectDeployedChains } from "@/lib/oso/utils"

// Cache the expensive getPublicProjectAction call to prevent duplicates
const cachedGetPublicProject = cache(getPublicProjectAction)

import {
  Contributors,
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

export async function generateMetadata({
  params,
}: {
  params: {
    projectId: string
  }
}): Promise<Metadata> {
  const metadataStartTime = Date.now()
  console.log(`[PERF] Starting generateMetadata for project: ${params.projectId}`)
  
  const project = await cachedGetPublicProject({ projectId: params.projectId })
  console.log(`[PERF] generateMetadata getPublicProjectAction took: ${Date.now() - metadataStartTime}ms`)

  const title = `Project: ${project?.name ?? ""} - OP Atlas`
  const description = project?.description ?? ""
  return {
    ...sharedMetadata,
    title,
    description,
    openGraph: {
      ...sharedMetadata.openGraph,
      title,
      description,
    },
  }
}

export default async function Page({ params }: PageProps) {
  const { projectId } = params
  const startTime = Date.now()
  console.log(`[PERF] Starting project page load for: ${projectId}`)

  const parallelStartTime = Date.now()
  const [session, publicProject, projectMetrics] = await Promise.all([
    auth(),
    cachedGetPublicProject({ projectId }),
    getProjectMetrics(projectId),
  ])
  
  const userId = session?.user?.id
  
  // Run membership check in parallel if user is authenticated
  const membershipStartTime = Date.now()
  const membershipResult = userId ? await verifyMembership(projectId, userId) : null
  const isMember = !!userId && !membershipResult?.error
  
  console.log(`[PERF] Parallel queries completed in: ${Date.now() - parallelStartTime}ms`)
  console.log(`[PERF] - auth(): ${session ? 'authenticated' : 'not authenticated'}`)
  console.log(`[PERF] - getPublicProjectAction(): ${publicProject ? 'found' : 'not found'}`)
  console.log(`[PERF] - getProjectMetrics(): ${projectMetrics ? 'loaded' : 'failed'}`)
  console.log(`[PERF] verifyMembership took: ${Date.now() - membershipStartTime}ms, result: ${isMember}`)

  if (!publicProject) {
    console.log(`[PERF] Project not found, total time: ${Date.now() - startTime}ms`)
    return notFound()
  }

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

  console.log(`[PERF] Data processing completed, total server time: ${Date.now() - startTime}ms`)
  console.log(`[PERF] - deployedOn chains: ${deployedOn.length}`)
  console.log(`[PERF] - team size: ${publicProject.team?.length || 0}`)
  console.log(`[PERF] - applications: ${publicProject.applications?.length || 0}`)
  console.log(`[PERF] - enrolledInMission: ${enrolledInMission}`)

  return (
    <div className="w-full h-full mt-6 pb-12">
      <div className="mx-auto w-full max-w-[1128px] px-8 space-y-20">
        <div className="w-full mt-8">
          <Header
            projectId={projectId}
            isMember={isMember}
            thumbnail={publicProject.thumbnailUrl}
            banner={publicProject.bannerUrl}
          />
        </div>

        <div className="space-y-20 px-12 pt-12">
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

          {!publicProject.organization &&
            (publicProject.team?.length ?? 0) > 1 && (
              <Contributors
                contributors={publicProject.team!.map(({ user }) => ({
                  imageUrl: user.imageUrl,
                  name: user.name,
                  username: user.username ?? undefined,
                  id: user.id,
                }))}
              />
            )}

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
                <ul className="space-y-12">
                  {enrolledInOnchainBuilders && (
                    <li className="space-y-6">
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
                      <IncreaseYourImpact
                        type="onchain-builders"
                        projectId={projectId}
                        isMember={isMember}
                      />
                    </li>
                  )}
                  {enrolledInDevTooling && (
                    <li className="space-y-6">
                      <Mission
                        type="dev-tooling"
                        devToolingMetrics={devToolingMetrics}
                        eligibility={eligibility}
                        isMember={isMember}
                        projectName={publicProject.name ?? ""}
                      />
                      <IncreaseYourImpact
                        type="dev-tooling"
                        projectId={projectId}
                        isMember={isMember}
                      />
                    </li>
                  )}
                </ul>
              </div>
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
