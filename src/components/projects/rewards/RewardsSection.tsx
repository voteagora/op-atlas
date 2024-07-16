"use client"

import Image from "next/image"
import Link from "next/link"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ProjectWithDetails } from "@/lib/types"
import { numberWithCommas } from "@/lib/utils"

export function RewardsSection({ project }: { project: ProjectWithDetails }) {
  const round4Reward = project.rewards.find((reward) => reward.roundId === "4")

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <h3>Project rewards</h3>
        <div className="text-text-secondary">
          If this project receives any Retro Funding, we&apos;ll record it here.
        </div>
      </div>
      {round4Reward && (
        <Accordion
          type="single"
          collapsible
          className="w-full border border-default rounded-xl p-8"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger className="justify-between">
              <div className="flex items-center gap-1 flex-1">
                Retro Funding Round 4
              </div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-6 pt-6">
              <div className="flex flex-col gap-2">
                <div className="font-medium text-sm">Grant amount</div>
                <div className="border border-border rounded-lg flex px-3 py-[10px] gap-2 items-center">
                  <Image
                    src="/assets/chain-logos/optimism.png"
                    height={20}
                    width={20}
                    alt="Optimism"
                  />
                  <div className="text-sm">
                    {/* @ts-expect-error Next converts Decimal to number bc Server Components suck */}
                    {numberWithCommas(round4Reward.amount)}
                  </div>
                </div>
              </div>
              <Link href={`/rewards/${round4Reward.id}`}>
                <Button variant="destructive">Claim</Button>
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}
