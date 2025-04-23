"use client"

import { format } from "date-fns"
import { Copy, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { toast } from "sonner"

import { Accordion, AccordionItem } from "@/components/ui/accordion"
import { getCutoffDate } from "@/lib/utils"
import { cn, copyToClipboard, formatNumber } from "@/lib/utils"

import { REWARDS_NAMES } from "./constants"
import { RecurringRewardsByRound } from "@/lib/utils/rewards"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import TrackedExtendedLink from "@/components/common/TrackedExtendedLink"
import { formatEther } from "viem"
import OutboundArrowLink from "@/components/common/OutboundArrowLink"

const SUPERFLUID_STREAM_URL = "https://app.superfluid.org/stream/optimism/"

const RewardAccordion = ({
  reward,
  isAdmin,
  teamVerified,
}: {
  reward: RecurringRewardsByRound
  isAdmin?: boolean
  teamVerified?: boolean
}) => {
  const { projectId } = useParams()

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

  const totalReward = reward.rewards.reduce(
    (acc, curr) => acc + BigInt(curr.amount),
    BigInt(0),
  )

  const linkToStream =
    reward.streams[0]?.id && `${SUPERFLUID_STREAM_URL}${reward.streams[0]?.id}`

  // States
  // 1. KYC not verified
  // 1.a Has KYCTeam
  // 1.b Has soft deleted KYCTeam
  // 1.c Does not have KYCTeam
  // 2. KYC verified
  // 2.a Has Superfluid stream
  // 2.b Does not have Superfluid stream

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
              {formatNumber(formatEther(totalReward))}
            </div>
            {linkToStream && (
              <OutboundArrowLink
                target={linkToStream}
                className="text-secondary-foreground ml-auto text-sm"
                text="View on Superfluid"
              />
            )}
          </div>
        </div>
        <div
          className={cn("mt-2 px-3 py-2.5 rounded-md", {
            "text-red-600 bg-red-200": !isAdmin || (isAdmin && !teamVerified),
            "text-callout-foreground bg-callout": isAdmin && teamVerified,
          })}
        >
          {!isAdmin && <YouAreNotAdminCallout />}
          {isAdmin && !teamVerified && (
            <CantClaimCallout projectId={projectId as string} />
          )}
          {isAdmin && teamVerified && <ScheduleClaimCallout />}
        </div>
      </AccordionItem>
    </Accordion>
  )
}

export default RewardAccordion

const YouAreNotAdminCallout = () => {
  return (
    <p>You are not an admin of this project and cannot claim this grant.</p>
  )
}

const CantClaimCallout = ({ projectId }: { projectId: string }) => {
  return (
    <p>
      You can’t claim your tokens until you’ve completed KYC for your{" "}
      <Link
        href={`/projects/${projectId}/grant-addresses`}
        className="underline"
      >
        grant delivery address
      </Link>
      .
    </p>
  )
}

const ScheduleClaimCallout = () => {
  const getReleaseDate = () => {
    const releaseDate = getCutoffDate()
    return format(releaseDate, "MMMM d, yyyy")
  }

  return (
    <p>
      Optimism only releases tokens to Superfluid once per month. Yours will be
      available to claim on or after {getReleaseDate()}.
    </p>
  )
}
