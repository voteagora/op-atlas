import { formatNumber } from "@/lib/utils"

import { Little } from "./Little"

export function RewardedOP({ amount }: { amount: number }) {
  return (
    <Little
      title={`${formatNumber(amount)} OP`}
      description="Rewarded across projects so far"
    />
  )
}
