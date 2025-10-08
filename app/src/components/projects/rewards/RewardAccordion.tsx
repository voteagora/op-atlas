"use client"

import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Check, Information } from "@/components/icons/remix"
import { Button } from "@/components/ui/button"
import {
  CantClaimCallout,
  UnclaimedRewardsCallout,
  YouAreNotAdminCallout,
} from "@/components/ui/callouts"
import { useSessionAdminProjects } from "@/hooks/db/useAdminProjects"
import { useProjectKycTeam } from "@/hooks/db/useProjectKycTeam"
import { REWARD_CLAIM_STATUS } from "@/lib/constants"
import { ProjectWithFullDetails } from "@/lib/types"
import { copyToClipboard, formatNumber } from "@/lib/utils"
import { isKycTeamVerified } from "@/lib/utils/kyc"
import { truncateAddress } from "@/lib/utils/string"

import { REWARDS_NAMES } from "./constants"

const RewardAccordion = ({
  reward,
}: {
  reward: ProjectWithFullDetails["rewards"][0]
}) => {
  const rewardRoundId = reward.roundId as keyof typeof REWARDS_NAMES
  const isClaimed = reward.claim?.status === REWARD_CLAIM_STATUS.CLAIMED
  const isLegacyRound =
    reward.roundId === "4" || reward.roundId === "5" || reward.roundId === "6"
  const [isAdmin, setIsAdmin] = useState(false)
  const [isKyc, setIsKyc] = useState(false)

  const { data: adminProjects } = useSessionAdminProjects()
  const { data: kycTeamData } = useProjectKycTeam({
    projectId: reward.projectId,
  })

  useEffect(() => {
    const isAdmin = adminProjects?.some(
      (project) => project.id === reward.projectId,
    )

    setIsAdmin(isAdmin ?? false)
  }, [adminProjects, reward])

  useEffect(() => {
    setIsKyc(
      reward.claim?.kycStatus === "delivered" && isKycTeamVerified(kycTeamData),
    )
  }, [reward.claim?.kycStatus, kycTeamData])

  const handleCopyAddress = async (address: string) => {
    try {
      await copyToClipboard(address)
      toast("Copied to clipboard")
    } catch (error) {
      toast.error("Error copying URL")
    }
  }

  const renderExpirationDate = () => {
    const endDate = REWARDS_NAMES[rewardRoundId].endDate

    if (reward.claim?.status === REWARD_CLAIM_STATUS.EXPIRED && isLegacyRound) {
      return (
        <div className="text-secondary-foreground text-sm flex items-center gap-1">
          <Information className="w-4 h-4" fill="#404454" />
          Expired {endDate}
        </div>
      )
    }
    if (reward.claim?.status === REWARD_CLAIM_STATUS.PENDING && isLegacyRound) {
      return (
        <div className="text-secondary-foreground text-sm flex items-center gap-1">
          <Information className="w-4 h-4" fill="#404454" />
          Expires {endDate}
        </div>
      )
    }
  }
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex flex-col space-y-2">
        <div>
          <p className="font-normal text-foreground text-sm">
            {REWARDS_NAMES[rewardRoundId].name}
          </p>
          <span className="text-secondary-foreground font-normal text-sm">
            {REWARDS_NAMES[rewardRoundId].date}
          </span>
        </div>
        <div className="border border-border rounded-lg flex px-3 py-[10px] gap-3 items-center justify-between">
          <div className="flex flex-row items-center gap-3">
            {isClaimed && (
              <Check className="w-[20px] h-[20px]" fill="#0DA529" />
            )}

            <div className="text-sm text-secondary-foreground">
              {/* @ts-expect-error Next converts Decimal to number bc Server Components suck */}
              {formatNumber(reward.amount)} OP
            </div>
            {reward.claim?.address && (
              <button
                type="button"
                className="text-secondary-foreground text-xs font-normal bg-secondary rounded-lg px-2 py-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => handleCopyAddress(reward.claim?.address ?? "")}
              >
                To: {truncateAddress(reward.claim?.address)}
              </button>
            )}
          </div>
          {renderExpirationDate()}
        </div>
      </div>

      {adminProjects &&
        reward.claim?.status === REWARD_CLAIM_STATUS.PENDING &&
        !isAdmin && <YouAreNotAdminCallout />}

      {adminProjects &&
        reward.claim?.status === REWARD_CLAIM_STATUS.PENDING &&
        isAdmin &&
        isKyc && <UnclaimedRewardsCallout />}

      {reward.claim?.status === REWARD_CLAIM_STATUS.PENDING &&
        isAdmin &&
        !isKyc && <CantClaimCallout projectId={reward.projectId} />}

      <div className="flex flex-col gap-6">
        {reward.claim?.tokenStreamClaimableAt && (
          <div className="flex flex-col gap-2 w-full">
            <div className="font-normal text-sm text-foreground">
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
    </div>
  )
}

export default RewardAccordion
