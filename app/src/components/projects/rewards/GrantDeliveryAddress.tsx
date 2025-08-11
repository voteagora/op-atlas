"use client"

import { CheckIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { isKycTeamVerified } from "@/lib/actions/rewards"
import { KYCTeamWithTeam } from "@/lib/types"
import { getValidUntil, shortenAddress } from "@/lib/utils"

export default function GrantDeliveryAddress({
  kycTeam,
}: {
  kycTeam?: KYCTeamWithTeam
}) {
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const checkKycStatus = async () => {
      if (kycTeam?.id) {
        const verified = await isKycTeamVerified(kycTeam.id)
        setIsCompleted(verified)
      } else {
        setIsCompleted(false)
      }
    }

    checkKycStatus()
  }, [kycTeam])

  if (!isCompleted || !kycTeam) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="font-medium text-sm text-foreground">
        Grant delivery address
      </div>
      <div className="input-container space-x-1.5">
        <span className="text-sm text-foreground">
          {shortenAddress(kycTeam.walletAddress)}
        </span>
        <div className="px-2 py-1 bg-success text-success-foreground font-medium text-xs rounded-full flex space-x-1 items-center">
          <CheckIcon size={12} />
          <span>Valid until {getValidUntil(kycTeam.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}
