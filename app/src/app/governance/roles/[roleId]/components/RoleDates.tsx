"use client"

import { formatMMMd } from "@/lib/utils/date"
import { Role } from "@prisma/client"

export const RoleDates = ({ role }: { role: Role }) => {
  const isSecurityRole = role.isSecurityRole || false;
  let prefixText = "Submit your application between";
  let startDate = role.startAt;
  let endDate = role.endAt;
  const isNominationPhase = role.endAt && new Date() <= new Date(role.endAt);

  const endorsementPhase =
    role.endorsementEndAt &&
    new Date() <= new Date(role.endorsementEndAt) &&
    !isNominationPhase
  const isVotingPhase =
    role.voteEndAt &&
    new Date() <= new Date(role.voteEndAt) &&
    !isNominationPhase

  const isClosed = role.voteEndAt && new Date() > new Date(role.voteEndAt)

  if (isClosed) {
    return (
      <div className="text-muted-foreground flex flex-row gap-2">
        <div>The application period has ended.</div>
      </div>
    )
  }

  if (isSecurityRole && endorsementPhase) {
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
