import Image from "next/image"
import Link from "next/link"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import DevToolingMission from "./DevToolingMission"
import OnchainBuilderMission from "./OnchainBuilderMission"
import { OnchainBuildersDataType } from "./types"

interface MissionProps {
  isMember: boolean
  projectName?: string
  type: "on-chain" | "dev-tooling"
  metrics?: {
    activeAddresses?: OnchainBuildersDataType
    gasFees?: OnchainBuildersDataType
    transactions?: OnchainBuildersDataType
    tvl?: OnchainBuildersDataType
    eligibility: {
      hasDefillamaAdapter: boolean
      hasQualifiedAddresses: boolean
      hasBundleBear: boolean
    }
  }
  projectOSOData?: {
    topProjects?: {
      id?: string
      name?: string
      website?: string[]
      thumbnailUrl?: string
    }[]
    hasBundleBear: boolean
    devToolingReward: number
    devToolingEligible: boolean
    hasDefillamaAdapter: boolean
    onchainBuilderReward: number
    onchainBuilderEligible: boolean
    onchainBuildersInAtlasCount: number
  } | null
  deployedOnWorldchain?: boolean
  applicationDate?: Date
  opReward: number | null
}

const getDateRange = (type: MissionProps["type"]) =>
  type === "on-chain" ? "Feb 17 - Jul 30, 2025" : "Feb 4 - Jul 30, 2025"

const getMissionLink = (type: MissionProps["type"]) =>
  type === "on-chain"
    ? "https://atlas.optimism.io/missions/retro-funding-onchain-builders"
    : "https://atlas.optimism.io/missions/retro-funding-dev-tooling"

function MissionHeader({ type }: { type: MissionProps["type"] }) {
  return (
    <div className="flex items-center space-x-4">
      <Image
        src="/assets/icons/sunny-red.svg"
        width={48}
        height={48}
        alt="Project Profile"
      />
      <div className="flex flex-col justify-between">
        <div className="flex items-center space-x-2">
          <Link
            href={getMissionLink(type)}
            className="font-semibold text-base text-foreground"
          >
            {type === "on-chain"
              ? "Retro Funding: Onchain Builders"
              : "Retro Funding: Dev Tooling"}
          </Link>
          <span className="px-2 py-1 bg-callout text-callout-foreground rounded-full text-xs font-medium">
            In Progress
          </span>
        </div>
        <p className="text-secondary-foreground font-normal text-base">
          {getDateRange(type)}
        </p>
      </div>
    </div>
  )
}

export default function Mission({
  isMember,
  projectName,
  type,
  metrics,
  projectOSOData,
  deployedOnWorldchain,
  applicationDate,
  opReward,
}: MissionProps) {
  const totalGasFees = Object.values(metrics?.gasFees ?? {}).reduce(
    (acc, curr) => acc + curr,
    0,
  )

  const onchainData = {
    ...(metrics ?? {}),
    opReward,
    isMember,
    deployedOnWorldchain,
    onchainBuilderEligible: projectOSOData?.onchainBuilderEligible,
  }

  const devToolingData = {
    gasConsumed: totalGasFees,
    opReward,
    onchainBuildersInAtlasCount: projectOSOData?.onchainBuildersInAtlasCount,
    topProjects: projectOSOData?.topProjects,
    isEligible: projectOSOData?.devToolingEligible,
    isMember,
    projectName: projectName ?? "",
  }

  if (!applicationDate) {
    return null
  }

  return (
    <Accordion type="single" collapsible defaultValue="retro-funding">
      <AccordionItem value="retro-funding" className="w-full">
        <div className="flex items-center justify-between">
          <MissionHeader type={type} />
          <AccordionTrigger />
        </div>

        <AccordionContent>
          {type === "on-chain" ? (
            <OnchainBuilderMission
              projectName={projectName ?? ""}
              data={onchainData}
              applicationDate={applicationDate}
            />
          ) : (
            <DevToolingMission
              projectName={projectName ?? ""}
              data={devToolingData}
              applicationDate={applicationDate}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
