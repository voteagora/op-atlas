"use client"

import { addYears, format, parse } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { toast } from "sonner"

import { Information } from "@/components/icons/remix"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { REWARD_CLAIM_STATUS } from "@/lib/constants"
import { ProjectWithFullDetails } from "@/lib/types"
import { copyToClipboard, formatNumber } from "@/lib/utils"
import { truncateAddress } from "@/lib/utils/string"

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

  const renderExpirationDate = () => {
    const originalDate = REWARDS_NAMES[rewardRoundId].date
    const parsedDate = parse(originalDate, "MMM d, yyyy", new Date())

    if (
      reward.claim?.status === REWARD_CLAIM_STATUS.EXPIRED &&
      (reward.roundId === "4" ||
        reward.roundId === "5" ||
        reward.roundId === "6")
    ) {
      const datePlusOneYear = addYears(parsedDate, 1)
      const formattedDate = format(datePlusOneYear, "MMM d, yyyy")

      return (
        <div className="text-secondary-foreground text-sm flex items-center gap-1">
          <Information className="w-4 h-4" fill="#404454" />
          Expired {formattedDate}
        </div>
      )
    }
    if (
      reward.claim?.status === REWARD_CLAIM_STATUS.PENDING &&
      (reward.roundId === "4" ||
        reward.roundId === "5" ||
        reward.roundId === "6")
    ) {
      const datePlusOneYear = addYears(parsedDate, 1)
      const formattedDate = format(datePlusOneYear, "MMM d, yyyy")

      return (
        <div className="text-secondary-foreground text-sm flex items-center gap-1">
          <Information className="w-4 h-4" fill="#404454" />
          Expires {formattedDate}
        </div>
      )
    }
  }
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
          <div className="border border-border rounded-lg flex px-3 py-[10px] gap-3 items-center justify-between">
            <div className="flex flex-row items-center gap-3">
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
              {reward.claim?.address && (
                <button
                  type="button"
                  className="text-secondary-foreground text-xs font-medium bg-secondary rounded-lg px-2 py-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleCopyAddress(reward.claim?.address ?? "")}
                  aria-label={`Copy address ${truncateAddress(
                    reward.claim?.address,
                  )} to clipboard`}
                >
                  To: {truncateAddress(reward.claim?.address)}
                </button>
              )}
            </div>
            {renderExpirationDate()}
          </div>
        </div>

        <AccordionContent className="flex flex-col gap-6 pt-6">
          <div className="flex flex-col gap-6">
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
