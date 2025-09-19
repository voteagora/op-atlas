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

export function RoleRow({
  role,
}: {
  role: Role
}) {
  const isActive =
    role.startAt &&
    role.endAt &&
    new Date() >= new Date(role.startAt) &&
    new Date() <= new Date(role.endAt)
  const isUpcoming = role.startAt && new Date() < new Date(role.startAt)

  let startDate = formatMMMd(role.startAt || new Date())
  let endDate = formatMMMd(role.endAt || new Date())

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
