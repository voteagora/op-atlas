"use client"

import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { formatNumber } from "@/lib/utils"

import { REWARDS_NAMES } from "./constants"
import { RecurringRewardsByRound } from "@/lib/utils/rewards"
import { useParams } from "next/navigation"
import { formatEther } from "viem"
import OutboundArrowLink from "@/components/common/OutboundArrowLink"
import { isKycTeamVerified } from "@/lib/utils/kyc"
import GrantDeliveryAddress from "./GrantDeliveryAddress"
import { useAppDialogs } from "@/providers/DialogProvider"
import { KYCTeamWithTeam } from "@/lib/types"
import {
  CantClaimCallout,
  ScheduleClaimCallout,
  YouAreNotAdminCallout,
} from "@/components/ui/callouts"

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
    teamVerified &&
    sortedStreams[0]?.id &&
    !sortedStreams[0]?.deletedAt &&
    `${SUPERFLUID_STREAM_URL}${sortedStreams[0]?.id}`

  const stoppedStreams = teamVerified
    ? sortedStreams.filter((stream) => stream.deletedAt)
    : sortedStreams

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

            {teamVerified && reward.kycTeam && linkToStream && (
              <IsSomethingWrong kycTeam={reward.kycTeam} />
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

  const stopedText = stream.deletedAt
    ? `The stream stopped on ${format(
        new Date(stream.deletedAt),
        "MMMM d, yyyy",
      )}. Partial rewards
        were sent to`
    : "This stream will be stopped with the next update job. Receiver address:  "

  return (
    <div className="border border-border rounded-lg px-3 py-2.5">
      <span className="text-secondary-foreground font-normal text-sm">
        {stopedText}
        <Link href={linkToStream} target="_blank">
          {stream.receiver}
        </Link>
        .
      </span>
    </div>
  )
}

const IsSomethingWrong = ({ kycTeam }: { kycTeam: KYCTeamWithTeam }) => {
  const { setData, setOpenDialog } = useAppDialogs()
  const { projectId, organizationId } = useParams()

  const openDeleteKYCTeamDialog = () => {
    setData({
      kycTeamId: kycTeam?.id,
      projectId: projectId as string,
      organizationId: organizationId as string,
      rewardStreamId: kycTeam?.rewardStream?.id,
    })
    setOpenDialog("delete_kyc_team")
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-secondary-foreground">
        Is something wrong?
      </span>
      <button
        className="underline text-sm text-secondary-foreground"
        onClick={openDeleteKYCTeamDialog}
      >
        Stop this stream
      </button>
    </div>
  )
}
