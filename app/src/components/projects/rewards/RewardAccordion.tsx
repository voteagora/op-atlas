"use client"

import { addYears, format, parse } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Information, InformationFill } from "@/components/icons/remix"
import { Optimism } from "@/components/icons/socials"
import { Button } from "@/components/ui/button"
import { useSessionAdminProjects } from "@/hooks/db/useAdminProjects"
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
  const rewardRoundId = reward.roundId as keyof typeof REWARDS_NAMES
  const isOlderRound =
    reward.roundId === "4" || reward.roundId === "5" || reward.roundId === "6"
  const [isAdmin, setIsAdmin] = useState(false)
  const [isKyc, setIsKyc] = useState(false)

  const { data: adminProjects } = useSessionAdminProjects()

  useEffect(() => {
    const isAdmin = adminProjects?.some(
      (project) => project.id === reward.projectId,
    )
    const isKyc =
      reward.claim?.kycStatus === "delivered" && reward.claim?.address !== null

    setIsAdmin(isAdmin ?? false)
    setIsKyc(isKyc ?? false)
  }, [adminProjects, reward])

  const handleCopyAddress = async (address: string) => {
    try {
      await copyToClipboard(address)
      toast("Copied to clipboard")
    } catch (error) {
      toast.error("Error copying URL")
    }
  }

  const renderExpirationDate = () => {
    const originalDate = REWARDS_NAMES[rewardRoundId].date
    const parsedDate = parse(originalDate, "MMM d, yyyy", new Date())

    if (reward.claim?.status === REWARD_CLAIM_STATUS.EXPIRED && isOlderRound) {
      const datePlusOneYear = addYears(parsedDate, 1)
      const formattedDate = format(datePlusOneYear, "MMM d, yyyy")

      return (
        <div className="text-secondary-foreground text-sm flex items-center gap-1">
          <Information className="w-4 h-4" fill="#404454" />
          Expired {formattedDate}
        </div>
      )
    }
    if (reward.claim?.status === REWARD_CLAIM_STATUS.PENDING && isOlderRound) {
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
    <div className="w-full flex flex-col gap-2">
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
            <Optimism className="w-[20px] h-[20px]" fill="#ff0000" />
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

      {adminProjects &&
        reward.claim?.status === REWARD_CLAIM_STATUS.PENDING &&
        !isAdmin && (
          <div className="flex flex-row gap-2 items-center w-full text-red-600 bg-red-200 px-3 py-2 rounded-lg">
            <InformationFill className="w-5 h-5" fill="#B80018" />
            <div className="font-medium text-sm">
              You are not an admin of this project and cannot claim this grant.
            </div>
          </div>
        )}

      {reward.claim?.status === REWARD_CLAIM_STATUS.PENDING &&
        isAdmin &&
        !isKyc && (
          <div className="flex flex-row gap-2 items-center w-full text-red-600 bg-red-200 px-3 py-2 rounded-lg">
            <InformationFill className="w-5 h-5" fill="#B80018" />
            <div className="font-medium text-sm">
              You can&apos;t claim your tokens until you&apos;ve completed KYC
              for your{" "}
              <Link
                href={`/projects/${reward.projectId}/grant-address`}
                className="underline"
              >
                grant delivery address
              </Link>
              .
            </div>
          </div>
        )}

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
    </div>
  )
}

export default RewardAccordion
