"use client"

import { format } from "date-fns"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { formatEther } from "viem"

import OutboundArrowLink from "@/components/common/OutboundArrowLink"
import {
  CantClaimCallout,
  ScheduleClaimCallout,
  StreamingHelpCallout,
  YouAreNotAdminCallout,
} from "@/components/ui/callouts"
import { copyToClipboard, formatNumber } from "@/lib/utils"
import { isKycStreamTeamVerified } from "@/lib/utils/kyc"
import {
  RecurringRewardKycTeam,
  RecurringRewardsByRound,
} from "@/lib/utils/rewards"
import { truncateAddress } from "@/lib/utils/string"
import { useAppDialogs } from "@/providers/DialogProvider"

import { REWARDS_NAMES } from "./constants"

const SUPERFLUID_STREAM_URL = "https://app.superfluid.org/vesting/optimism/"

const RewardAccordion = ({
  reward,
  isAdmin,
}: {
  reward: RecurringRewardsByRound
  isAdmin?: boolean
}) => {
  const { projectId } = useParams()

  const rewardRoundId = reward.roundId as keyof typeof REWARDS_NAMES

  const totalReward = reward.rewards.reduce(
    (acc, curr) => acc + BigInt(curr.amount),
    BigInt(0),
  )

  const teamVerified = isKycStreamTeamVerified(reward.kycTeam)

  const sortedStreams = reward.streams.sort((a, b) => {
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const linkToStream =
    teamVerified &&
    sortedStreams[0]?.id &&
    sortedStreams[0]?.receiver?.toLowerCase() ===
      reward.kycTeam?.walletAddress?.toLowerCase() &&
    `${SUPERFLUID_STREAM_URL}${sortedStreams[0]?.id}`

  const stoppedStreams = teamVerified
    ? sortedStreams.filter(
        (stream) =>
          stream.receiver?.toLowerCase() !==
          reward.kycTeam?.walletAddress?.toLowerCase(),
      )
    : sortedStreams

  const handleCopyAddress = async (address: string) => {
    try {
      await copyToClipboard(address)
      toast("Copied to clipboard")
    } catch (error) {
      toast.error("Error copying URL")
    }
  }

  return (
    <div>
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
            <div className="text-sm text-secondary-foreground">
              {formatNumber(formatEther(totalReward))} OP
            </div>

            {reward.kycTeam && linkToStream && teamVerified && (
              <button
                type="button"
                className="text-secondary-foreground text-xs font-medium bg-secondary rounded-lg px-2 py-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() =>
                  handleCopyAddress(reward?.kycTeam?.walletAddress ?? "")
                }
              >
                To: {truncateAddress(reward?.kycTeam?.walletAddress ?? "")}
              </button>
            )}

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

        {isAdmin && teamVerified && linkToStream && (
          <div className="mt-4">
            <StreamingHelpCallout />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 pt-4">
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
    </div>
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

const IsSomethingWrong = ({ kycTeam }: { kycTeam: RecurringRewardKycTeam }) => {
  const { setData, setOpenDialog } = useAppDialogs()
  const { projectId, organizationId } = useParams()

  const openDeleteKYCTeamDialog = () => {
    setData({
      kycTeamId: kycTeam?.id,
      projectId: projectId as string,
      organizationId: organizationId as string,
      hasActiveStream:
        kycTeam?.rewardStreams && kycTeam.rewardStreams.length > 0,
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
