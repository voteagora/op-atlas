import { CheckIcon } from "lucide-react"
import { LockIcon } from "lucide-react"

import { KYCTeamWithTeam } from "@/lib/types"
import { shortenAddress } from "@/lib/utils"
import { getValidUntil } from "@/lib/utils"
import { isKycTeamVerified } from "@/lib/utils/kyc"

export default function GrantDeliveryAddress({
  kycTeam,
}: {
  kycTeam?: KYCTeamWithTeam
}) {
  const isCompleted = isKycTeamVerified(kycTeam)

  if (!isCompleted || !kycTeam) {
    return null
  }
  const hasActiveStream =
    kycTeam.rewardStreams && kycTeam.rewardStreams.length > 0

  return (
    <div className="flex flex-col gap-2">
      <div className="font-normal text-sm text-foreground">
        Grant delivery address
      </div>
      <div className="input-container flex items-center justify-between">
        <div className=" flex flex-row space-x-1.5">
          <span className="text-sm text-foreground">
            {shortenAddress(kycTeam.walletAddress)}
          </span>
          <div className="px-2 py-1 bg-success text-success-foreground font-normal text-xs rounded-full flex space-x-1 items-center">
            <CheckIcon size={12} />
            <span>Valid until {getValidUntil(kycTeam.createdAt)}</span>
          </div>
        </div>
        {hasActiveStream && (
          <div
            className="flex items-center space-x-1 cursor-default"
            title="Active Superfluid stream, projects cannot be modified."
          >
            <LockIcon size={18} />
            <span className="text-sm">Locked</span>
          </div>
        )}
      </div>
    </div>
  )
}
