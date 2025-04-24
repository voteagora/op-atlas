"use client"

import { format } from "date-fns"
import { Copy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ProjectWithFullDetails } from "@/lib/types"
import { copyToClipboard, formatNumber } from "@/lib/utils"

import { REWARDS_NAMES } from "./constants"

const RewardAccordion = ({
  reward,
}: {
  reward: ProjectWithFullDetails["rewards"][0]
}) => {
  const [isExpanded, setIsExpanded] = React.useState("")

  const handleCopyAddress = async (address: string) => {
    try {
      await copyToClipboard(address)
      toast("Copied to clipboard")
    } catch (error) {
      toast.error("Error copying URL")
    }
  }

  const rewardRoundId = reward.roundId as keyof typeof REWARDS_NAMES

  return (
    <Accordion
      type="single"
      value={isExpanded}
      onValueChange={setIsExpanded}
      collapsible
      className="w-full border rounded-xl p-6"
    >
      <AccordionItem value="item-1" className="group">
        <div className="flex flex-col space-y-2">
          <div>
            <p className="font-medium text-foreground text-sm">
              {REWARDS_NAMES[rewardRoundId].name}
            </p>
            <span className="text-secondary-foreground font-normal text-sm">
              {REWARDS_NAMES[rewardRoundId].date}
            </span>
          </div>
          <div className="border border-border rounded-lg flex px-3 py-[10px] gap-2 items-center">
            <Image
              src="/assets/icons/op-icon.svg"
              height={20}
              width={20}
              alt="Optimism"
            />
            <div className="text-sm text-secondary-foreground">
              {/* @ts-expect-error Next converts Decimal to number bc Server Components suck */}
              {formatNumber(reward.amount)}
            </div>
          </div>
        </div>

        <AccordionContent className="flex flex-col gap-6 pt-6">
          <div className="flex flex-col gap-6">
            {reward.claim?.address && (
              <div className="flex flex-col gap-2">
                <div className="font-medium text-sm text-foreground">
                  Grant delivery address
                </div>
                <div className="border border-border rounded-lg flex px-3 py-[10px] gap-2 items-center">
                  <Image
                    src="/assets/icons/tickIcon.svg"
                    width={16}
                    height={16}
                    alt="Check"
                  />
                  <div className="text-sm text-foreground">
                    {reward.claim?.address}
                  </div>
                  <Button
                    onClick={() =>
                      handleCopyAddress(reward.claim?.address ?? "")
                    }
                    variant="ghost"
                    className="p-0 h-fit"
                  >
                    <Copy
                      className="rotate-90 text-muted cursor-pointer"
                      size={16}
                    />
                  </Button>
                </div>
              </div>
            )}
            {reward.claim?.tokenStreamClaimableAt && (
              <div className="flex flex-col gap-2 w-full">
                <div className="font-medium text-sm text-foreground">
                  Token stream
                </div>
                <div className="flex items-center gap-x-1.5">
                  <div className="border border-border rounded-lg w-full flex px-3 py-[10px] gap-2 items-center">
                    <Image
                      src="/assets/icons/tickIcon.svg"
                      width={16}
                      height={16}
                      alt="Check"
                    />
                    <div className="text-sm text-foreground">
                      Completed on{" "}
                      {format(
                        reward.claim?.tokenStreamClaimableAt,
                        "MMMM d, yyyy 'at' h:mm a",
                      )}
                    </div>
                  </div>
                  <Link href="/">
                    <Button variant="secondary">View</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
        <AccordionTrigger className="text-secondary-foreground font-medium text-sm mt-6">
          <span className="group-data-[state=open]:hidden">Show details</span>
          <span className="group-data-[state=closed]:hidden">
            Close details
          </span>
        </AccordionTrigger>
      </AccordionItem>
    </Accordion>
  )
}

export default RewardAccordion
