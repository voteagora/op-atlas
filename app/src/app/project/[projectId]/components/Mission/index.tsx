import Image from "next/image"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import Billboard from "./Billboard"
import RewardsTable from "./RewardsTable"
import UnclaimedRewards from "./UnclaimedRewards"

export default function Missions() {
  return (
    <div className="w-full space-y-6">
      <h4 className="font-semibold text-xl">Missions</h4>
      <Accordion type="single" collapsible>
        <AccordionItem
          value="retro-funding"
          className="rounded-xl border p-12 w-full h-fit"
        >
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
                  <span className="font-semibold">
                    Retro Funding: Onchain Builders
                  </span>
                  {/* TODO: Replace this with actual state */}
                  <span className="px-2 py-1 bg-callout text-callout-foreground rounded-full text-xs font-medium">
                    In Progress
                  </span>
                </div>
                {/* TODO: Replace this with actual date */}
                <span className="text-secondary-foreground font-normal">
                  Feb 12 - July 30, 2025
                </span>
              </div>
            </div>
            <AccordionTrigger />
          </div>
          <AccordionContent className="space-y-12">
            <RewardsTable />
            <Billboard />
            <UnclaimedRewards />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
