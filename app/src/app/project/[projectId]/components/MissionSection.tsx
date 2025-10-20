"use client"

import { Loader2 } from "lucide-react"

import { useMembership } from "@/hooks/project/useMembership"
import { useProjectMetrics } from "@/hooks/project/useProjectMetrics"
import { usePublicProject } from "@/hooks/project/usePublicProject"
import { TRANCHE_MONTHS_MAP } from "@/lib/oso/constants"
import { getProjectDeployedChains } from "@/lib/oso/utils"
import { formatNumber } from "@/lib/utils"

import { IncreaseYourImpact, Mission, MoreDetails, Performance } from "."

interface MissionSectionProps {
  projectId: string
  userId?: string
}

export default function MissionSection({
  projectId,
  userId,
}: MissionSectionProps) {
  const { data: membershipData } = useMembership(projectId, userId)
  const isMember = membershipData?.isMember ?? false

  const { data: publicProject } = usePublicProject(projectId)
  const { data: projectMetrics } = useProjectMetrics(projectId)

  if (!publicProject || !projectMetrics) {
    return (
      <div className="flex justify-center items-center mt-4">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
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

  const enrolledInDevTooling =
    publicProject.applications?.filter(
      (application) => application.roundId === "7",
    ).length > 0

  const enrolledInOnchainBuilders =
    publicProject.applications?.filter(
      (application) => application.roundId === "8",
    ).length > 0

  const enrolledInMission = enrolledInDevTooling || enrolledInOnchainBuilders

  // Get the current month (latest month in TRANCHE_MONTHS_MAP)
  const currentMonth =
    Object.values(TRANCHE_MONTHS_MAP).pop() ||
    Object.values(TRANCHE_MONTHS_MAP)[0]

  // Get rewards for current month
  const devToolingReward =
    devToolingMetrics?.devToolingReward?.[currentMonth]?.value ?? 0
  const onchainBuilderReward =
    onchainBuilderMetrics?.onchainBuilderReward?.[currentMonth]?.value ?? 0

  if (!enrolledInMission && !onchainBuilderMetrics) {
    return <MoreDetails />
  }

  return (
    <>
      {enrolledInMission && (
        <>
          {/* Mobile View - Simple Reward Cards */}
          <div className="md:hidden flex flex-col my-12">
            {enrolledInDevTooling && devToolingReward > 0 && (
              <div className="px-6 py-12 bg-[#fff0f1] rounded-xl border border-red-200 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[#0F111A] text-2xl font-normal leading-loose">
                    {formatNumber(devToolingReward, 2)} OP
                  </div>
                  <div className="text-center text-secondary-foreground text-base leading-normal">
                    Rewards in Retro Funding: Dev Tooling
                  </div>
                </div>
              </div>
            )}
            {enrolledInOnchainBuilders && onchainBuilderReward > 0 && (
              <div className="px-6 py-12 bg-[#fff0f1] rounded-xl border border-red-200 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[#0F111A] text-2xl font-normal leading-loose">
                    {formatNumber(onchainBuilderReward, 2)} OP
                  </div>
                  <div className="text-center text-secondary-foreground text-base leading-normal">
                    Rewards in Retro Funding: Onchain Builders
                  </div>
                </div>
              </div>
            )}
            <div className="h-[1px] bg-[#E0E2EB] my-12"></div>
          </div>

          {/* Desktop View - Full Details */}
          <div className="hidden md:block w-full space-y-6">
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

      {performanceMetrics &&
        Object.values(eligibility?.onchainBuilderEligibility ?? {}).some(
          Boolean,
        ) && (
          <>
            {/* Mobile View - Desktop Required Message */}
            <div className="md:hidden flex flex-col items-center gap-6">
              <div className="text-center text-[#0F111A] text-xl font-normal leading-7">
                Please use your desktop computer to view this project&apos;s
                stats and performance
              </div>
              <div className="text-center text-secondary-foreground text-base leading-normal">
                The mobile version of this page isn&apos;t ready yet.
              </div>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2.5 bg-secondary rounded-md flex items-center gap-2"
              >
                <div className="text-foreground text-sm font-medium leading-tight">
                  Back
                </div>
              </button>
            </div>

            {/* Desktop View - Full Performance */}
            <div className="hidden md:block">
              <Performance metrics={performanceMetrics} />
            </div>
          </>
        )}
    </>
  )
}