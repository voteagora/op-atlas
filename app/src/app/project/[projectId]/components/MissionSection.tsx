"use client"

import { Loader2 } from "lucide-react"

import { useMembership } from "@/hooks/project/useMembership"
import { useProjectMetrics } from "@/hooks/project/useProjectMetrics"
import { usePublicProject } from "@/hooks/project/usePublicProject"
import { getProjectDeployedChains } from "@/lib/oso/utils"

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

  if (!enrolledInMission && !onchainBuilderMetrics) {
    return <MoreDetails />
  }

  return (
    <>
      {enrolledInMission && (
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
      )}

      {performanceMetrics &&
        Object.values(eligibility?.onchainBuilderEligibility ?? {}).some(
          Boolean,
        ) && <Performance metrics={performanceMetrics} />}
    </>
  )
}