import Link from "next/link"
import { ChevronDown } from "lucide-react"

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
  type === "on-chain" ? "Feb 17 - Dec 31, 2025" : "Feb 4 - Dec 31, 2025"

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
            <div className="flex flex-col justify-between">
              <div className="flex items-center space-x-2">
                <h4 className="text-xl leading-7 font-semibold text-foreground">
                  <Link href={getMissionLink(type)} className="hover:underline">
                    {type === "on-chain"
                      ? "Retro Funding: Onchain Builders"
                      : "Retro Funding: Dev Tooling"}
                  </Link>
                </h4>
                <span className="px-2 py-1 bg-callout text-callout-foreground rounded-full text-xs font-medium">
                  In Progress
                </span>
              </div>
              <p className="text-secondary-foreground font-normal text-base">
                {getDateRange(type)}
              </p>
            </div>
          </div>
          <AccordionTrigger hideChevron className="w-8 h-8 rounded-md p-0 justify-center hover:bg-secondary" aria-label="Toggle section">
            <ChevronDown className="h-4 w-4" />
          </AccordionTrigger>
        </div>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default function Mission(props: MissionProps) {
  if (props.type === "on-chain") {
    return (
      <MissionContainer type={props.type}>
        <OnchainBuilderMission data={props} />
      </MissionContainer>
    )
  } else {
    return (
      <MissionContainer type={props.type}>
        <DevToolingMission data={props} />
      </MissionContainer>
    )
  }
}
