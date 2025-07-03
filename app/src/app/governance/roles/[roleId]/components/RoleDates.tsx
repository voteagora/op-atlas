"use client"

import { formatMMMd } from "@/lib/utils/date"
import { Role } from "@prisma/client"

export const RoleDates = ({ role }: { role: Role }) => {
  const voteSchedule =
    role.voteStartAt && role.voteEndAt
      ? `Vote ${formatMMMd(new Date(role.voteStartAt!))} - ${formatMMMd(
          new Date(role.voteEndAt!),
        )}`
      : null

  return (
    <div className="text-muted-foreground flex flex-row gap-2">
      <div>
        Nominations {formatMMMd(new Date(role.startAt!))}
        {" - "}
        {formatMMMd(new Date(role.endAt!))}
      </div>

      {voteSchedule && <div>{" | "}</div>}
      {voteSchedule && <div>{voteSchedule}</div>}
    </div>
  )
}
