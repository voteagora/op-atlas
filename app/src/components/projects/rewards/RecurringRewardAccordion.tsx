"use client"

import { format } from "date-fns"
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
import { getCutoffDate } from "@/lib/utils"
import { copyToClipboard, formatNumber } from "@/lib/utils"

import { REWARDS_NAMES } from "./constants"
import { RecurringRewardsByRound } from "@/lib/utils/rewards"
import { useParams } from "next/navigation"
import { formatEther } from "viem"
import OutboundArrowLink from "@/components/common/OutboundArrowLink"
import { isKycTeamVerified } from "@/lib/utils/kyc"
import GrantDeliveryAddress from "./GrantDeliveryAddress"

const SUPERFLUID_STREAM_URL = "https://app.superfluid.org/stream/optimism/"

const RewardAccordion = ({
  reward,
  isAdmin,
}: {
  reward: RecurringRewardsByRound
  isAdmin?: boolean
}) => {
  const { projectId } = useParams()

  const [isExpanded, setIsExpanded] = React.useState("")

  const rewardRoundId = reward.roundId as keyof typeof REWARDS_NAMES

  const totalReward = reward.rewards.reduce(
    (acc, curr) => acc + BigInt(curr.amount),
    BigInt(0),
  )

  const teamVerified = isKycTeamVerified(reward.kycTeam)

  const sortedStreams = reward.streams.sort((a, b) => {
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const linkToStream =
    sortedStreams[0]?.id &&
    !sortedStreams[0]?.deletedAt &&
    `${SUPERFLUID_STREAM_URL}${sortedStreams[0]?.id}`

  const stoppedStreams = sortedStreams.filter((stream) => stream.deletedAt)

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
        <div className="flex flex-col gap-2">
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

          {!isAdmin && <YouAreNotAdminCallout />}
          {isAdmin && !teamVerified && (
            <CantClaimCallout projectId={projectId as string} />
          )}
          {isAdmin && teamVerified && !linkToStream && <ScheduleClaimCallout />}
        </div>
        <AccordionContent>
          <div className="flex flex-col gap-4 pt-4">
            {reward.kycTeam && linkToStream && (
              <GrantDeliveryAddress kycTeam={reward.kycTeam} />
            )}

            {stoppedStreams.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="font-medium text-sm text-foreground">Notes</div>
                {stoppedStreams.map((stream) => (
                  <StreamStoppedSection key={stream.id} stream={stream} />
                ))}
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

const StreamStoppedSection = ({
  stream,
}: {
  stream: RecurringRewardsByRound["streams"][0]
}) => {
  const linkToStream = `${SUPERFLUID_STREAM_URL}${stream.id}`

  return (
    <div className="border border-border rounded-lg px-3 py-2.5">
      <span className="text-secondary-foreground font-normal text-sm">
        The stream stopped on{" "}
        {format(new Date(stream.deletedAt!), "MMMM d, yyyy")}. Partial rewards
        were sent to{" "}
        <Link href={linkToStream} target="_blank">
          {stream.receiver}
        </Link>
        .
      </span>
    </div>
  )
}

const YouAreNotAdminCallout = () => {
  return (
    <div className="mt-2 px-3 py-2.5 rounded-md  text-red-600 bg-red-200">
      <span className="text-sm">
        You are not an admin of this project and cannot claim this grant.
      </span>
    </div>
  )
}

const CantClaimCallout = ({ projectId }: { projectId: string }) => {
  return (
    <div className="mt-2 px-3 py-2.5 rounded-md text-red-600 bg-red-200">
      <span className="text-sm">
        You can’t claim your tokens until you’ve completed KYC for your{" "}
        <Link
          href={`/projects/${projectId}/grant-addresses`}
          className="underline"
        >
          grant delivery address
        </Link>
        .
      </span>
    </div>
  )
}

const ScheduleClaimCallout = () => {
  const getReleaseDate = () => {
    const releaseDate = getCutoffDate()
    return format(releaseDate, "MMMM d, yyyy")
  }

  return (
    <div className="mt-2 px-3 py-2.5 rounded-md text-callout-foreground bg-callout">
      <span className="text-sm">
        Optimism only releases tokens to Superfluid once per month. Yours will
        be available to claim on or after {getReleaseDate()}.
      </span>
    </div>
  )
}
