type DateLike = Date | string | null | undefined

type RolePhaseDates = {
  startAt?: DateLike
  endAt?: DateLike
  endorsementStartAt?: DateLike
  endorsementEndAt?: DateLike
  voteStartAt?: DateLike
  voteEndAt?: DateLike
}

export type RolePhaseStatus = {
  isUpcoming: boolean
  isNominationPhase: boolean
  isEndorsementPhase: boolean
  isVotingPhase: boolean
  isClosed: boolean
}

const toDate = (value: DateLike) => (value ? new Date(value) : null)

export const getRolePhaseStatus = (
  role: RolePhaseDates,
  referenceDate: Date = new Date(),
): RolePhaseStatus => {
  const now = referenceDate

  const nominationStart = toDate(role.startAt)
  const nominationEnd = toDate(role.endAt)
  const endorsementStart = toDate(role.endorsementStartAt)
  const endorsementEnd = toDate(role.endorsementEndAt)
  const voteStart = toDate(role.voteStartAt)
  const voteEnd = toDate(role.voteEndAt)

  const hasStarted = (start: Date | null) => !start || now >= start

  const isNominationPhase = Boolean(
    nominationEnd && hasStarted(nominationStart) && now <= nominationEnd,
  )
  const isEndorsementPhase = Boolean(
    !isNominationPhase &&
      endorsementEnd &&
      hasStarted(endorsementStart) &&
      now <= endorsementEnd,
  )
  const isVotingPhase = Boolean(
    voteStart &&
      voteEnd &&
      hasStarted(voteStart) &&
      now <= voteEnd,
  )
  const isClosed = Boolean(voteEnd && now > voteEnd)

  const phaseStarts = [nominationStart, endorsementStart, voteStart]
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => a.getTime() - b.getTime())
  const earliestStart = phaseStarts[0] ?? null
  const isUpcoming = Boolean(
    earliestStart &&
      now < earliestStart &&
      !isNominationPhase &&
      !isEndorsementPhase &&
      !isVotingPhase,
  )

  return {
    isUpcoming,
    isNominationPhase,
    isEndorsementPhase,
    isVotingPhase,
    isClosed,
  }
}
