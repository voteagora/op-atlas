"use client"

import { formatMMMd } from "@/lib/utils/date"
import { getRolePhaseStatus } from "@/lib/utils/roles"
import { Role } from "@prisma/client"

export const RoleDates = ({ role }: { role: Role }) => {
  const isSecurityRole = role.isSecurityRole || false;
  let prefixText = "Submit your application between";
  let startDate = role.startAt;
  let endDate = role.endAt;
  const { isEndorsementPhase, isVotingPhase, isClosed } = getRolePhaseStatus(role)

  if (isClosed) {
    return (
      <div className="text-muted-foreground flex flex-row gap-2">
        <div>The application period has ended.</div>
      </div>
    )
  }

  if (isSecurityRole && isEndorsementPhase) {
    prefixText = "Approve candidates between";
    startDate = role.endorsementStartAt;
    endDate = role.endorsementEndAt;
  } else if (isSecurityRole && isVotingPhase) {
    prefixText = "Delegate vote between"
    startDate = role.voteStartAt
    endDate = role.voteEndAt
  }

  return (
    <div className="text-muted-foreground flex flex-row gap-2">
      <div>
        {prefixText} {formatMMMd(new Date(startDate!))}
        {" - "}
        {formatMMMd(new Date(endDate!))}
      </div>
    </div>
  )
}
