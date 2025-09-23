"use client"

import { Role } from "@prisma/client"

import ProposalCard, {
  ProposalArrow,
  ProposalBadge,
  ProposalBadgeType,
  ProposalDates,
  ProposalTextContent,
} from "@/components/proposals/proposalsPage/components/ProposalCard"
import { formatMMMd } from "@/lib/utils/date"
import { getRolePhaseStatus } from "@/lib/utils/roles"

export function RoleRow({
  role,
}: {
  role: Role
}) {
  const {
    isUpcoming,
    isNominationPhase,
    isEndorsementPhase,
    isVotingPhase,
  } = getRolePhaseStatus(role)
  const isActive = isNominationPhase || isEndorsementPhase || isVotingPhase;

  const phaseDates = (() => {
    if (isEndorsementPhase) {
      return {
        start: role.endorsementStartAt ?? role.startAt,
        end: role.endorsementEndAt ?? role.endAt,
      }
    }

    if (isNominationPhase || isUpcoming) {
      return {
        start: role.startAt,
        end: role.endAt,
      }
    }

    if (isVotingPhase) {
      return {
        start: role.voteStartAt ?? role.endorsementEndAt ?? role.startAt,
        end: role.voteEndAt ?? role.endAt,
      }
    }

    return {
      start: role.startAt,
      end: role.voteEndAt ?? role.endorsementEndAt ?? role.endAt ?? role.startAt,
    }
  })()

  const formatDate = (value: Date | null | undefined) =>
    formatMMMd(value ?? new Date())

  const startDate = formatDate(phaseDates.start)
  const endDate = formatDate(phaseDates.end)

  return (
    <ProposalCard
      href={`/governance/roles/${role.id}`}
    >
      <ProposalBadge
        type={
          isActive
            ? ProposalBadgeType.now
            : isUpcoming
            ? ProposalBadgeType.soon
            : ProposalBadgeType.closed
        }
      />
      <ProposalTextContent title={role.title} />
      <div className="hidden md:block">
        <ProposalDates
          startDate={startDate}
          endDate={endDate}
        />
      </div>
      <ProposalArrow
        href={`/governance/roles/${role.id}`}
        proposalType={"SELF_NOMINATION"}
      />
    </ProposalCard>
  )
}
