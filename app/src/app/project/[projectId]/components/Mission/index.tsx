import Image from "next/image"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import DevToolingMission from "./DevToolingMission"
import OnchainBuilderMission from "./OnchainBuilderMission"

interface MissionProps {
  type: "on-chain" | "dev-tooling"
}

export default function Mission({ type }: MissionProps) {
  return (
    <Accordion type="single" collapsible>
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
              {/* TODO: Replace this with actual date */}
              <p className="text-secondary-foreground font-normal text-base">
                Feb 12 - July 30, 2025
              </p>
            </div>
          </div>
          <AccordionTrigger />
        </div>
        <AccordionContent>
          {type === "on-chain" && <OnchainBuilderMission />}
          {type === "dev-tooling" && <DevToolingMission />}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
