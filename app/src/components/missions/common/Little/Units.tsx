import { formatNumber } from "@/lib/utils"

import { Little } from "./Little"

export function Units({ units }: { units: number }) {
  return (
    <Little
      title={`${formatNumber(units)} Units`}
      description="High quality onchain value"
    />
  )
}
