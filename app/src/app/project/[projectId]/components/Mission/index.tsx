import Image from "next/image"
import Link from "next/link"
import { match } from "ts-pattern"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import DevToolingMission from "./DevToolingMission"
import OnchainBuilderMission from "./OnchainBuilderMission"
import { MissionProps } from "@/lib/oso/types"

const getDateRange = (type: MissionProps["type"]) =>
  type === "on-chain" ? "Feb 17 - Jul 30, 2025" : "Feb 4 - Jul 30, 2025"

const getMissionLink = (type: MissionProps["type"]) =>
  type === "on-chain"
    ? "https://atlas.optimism.io/missions/retro-funding-onchain-builders"
    : "https://atlas.optimism.io/missions/retro-funding-dev-tooling"

function MissionContainer({
  children,
  type,
}: {
  children: React.ReactNode
  type: MissionProps["type"]
}) {
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
          <AccordionTrigger />
        </div>

        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default function Mission(props: MissionProps) {
  // const onchainData = {
  //   ...(metrics ?? {}),
  //   opReward,
  //   isMember,
  //   deployedOnWorldchain,
  //   onchainBuilderEligible: projectOSOData?.onchainBuilderEligible,
  // }

  // const devToolingData = {
  //   gasConsumed: projectOSOData?.projectsGasConsumption,
  //   opReward,
  //   onchainBuildersInAtlasCount: projectOSOData?.onchainBuildersInAtlasCount,
  //   topProjects: projectOSOData?.topProjects,
  //   isEligible: projectOSOData?.devToolingEligible,
  //   isMember,
  //   projectName: projectName ?? "",
  // }

  if (!props.applicationDate) {
    return null
  }

  if (props.type === "on-chain") {
    return (
      <MissionContainer type={props.type}>
        <OnchainBuilderMission data={props} />
      </MissionContainer>
    )
  }
}
