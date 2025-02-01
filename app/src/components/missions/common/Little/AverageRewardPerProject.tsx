import { formatNumber } from "@/lib/utils"

import { Little } from "./Little"

export function AverageRewardPerProject({
  avgOpRewardPerProject,
}: {
  avgOpRewardPerProject: number
}) {
  return (
    <Little
      title={`${formatNumber(avgOpRewardPerProject)} OP`}
      description="Average rewards per project"
    />
  )
}
