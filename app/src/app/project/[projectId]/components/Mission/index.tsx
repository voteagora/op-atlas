import Image from "next/image"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import DevToolingMission from "./DevToolingMission"
import { OnchainBuilderMission } from "./OnchainBuilderMission"
import { OnchainBuildersDataType } from "./types"

interface MissionProps {
  isMember: boolean
  projectName?: string
  type: "on-chain" | "dev-tooling"
  onchainBuildersMetrics?: {
    activeAddresses: OnchainBuildersDataType
    gasFees: OnchainBuildersDataType
    transactions: OnchainBuildersDataType
    tvl: OnchainBuildersDataType
    eligibility: {
      hasDefillamaAdapter: boolean
      hasQualifiedAddresses: boolean
      hasBundleBear: boolean
    }
  }
  projectOSOData?: any
  deployedOnWorldchain?: boolean
}

export default function Mission({
  isMember,
  projectName,
  type,
  onchainBuildersMetrics,
  projectOSOData,
  deployedOnWorldchain,
}: MissionProps) {
  const formatDateRange = (startDate: string, endDate: string) => {
    const formattedFirstDate = new Date(startDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    const formattedFirstDateYear = new Date(startDate).getFullYear()

    const formattedLastDate = new Date(endDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    const formattedLastDateYear = new Date(endDate).getFullYear()

    return formattedFirstDateYear === formattedLastDateYear
      ? `${formattedFirstDate.split(",")[0]} - ${formattedLastDate}`
      : `${formattedFirstDate} - ${formattedLastDate}`
  }

  const totalGasFees = Object.values(
    onchainBuildersMetrics?.gasFees ?? {},
  ).reduce((acc, curr) => acc + curr, 0)

  return (
    <Accordion type="single" collapsible defaultValue="retro-funding">
      <AccordionItem value="retro-funding" className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/assets/icons/sunny-red.svg"
              width={48}
              height={48}
              alt="Project Profile"
            />
            <div className="flex flex-col justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base text-foreground">
                  {type === "on-chain" && "Retro Funding: Onchain Builders"}
                  {type === "dev-tooling" && "Retro Funding: Dev Tooling"}
                </span>
                {/* TODO: Replace this with actual state */}
                <span className="px-2 py-1 bg-callout text-callout-foreground rounded-full text-xs font-medium">
                  In Progress
                </span>
              </div>
              <p className="text-secondary-foreground font-normal text-base">
                Feb 12 - July 30, 2025
              </p>
            </div>
          </div>
          <AccordionTrigger />
        </div>
        <AccordionContent>
          {type === "on-chain" && (
            <OnchainBuilderMission
              data={{
                ...(onchainBuildersMetrics as any),
                opReward: Math.round(projectOSOData?.onchainBuilderReward ?? 0),
                isMember,
                deployedOnWorldchain,
              }}
            />
          )}
          {type === "dev-tooling" && (
            <DevToolingMission
              isMember={isMember}
              projectName={projectName ?? ""}
              data={{
                gasConsumed: totalGasFees,
                opReward: Math.round(projectOSOData?.devToolingReward ?? 0),
                onchainBuildersInAtlasCount:
                  projectOSOData?.onchainBuildersInAtlasCount,
                topProjects: projectOSOData?.topProjects,
                isEligible: projectOSOData?.devToolingEligible,
              }}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
