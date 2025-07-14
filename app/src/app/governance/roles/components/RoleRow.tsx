"use client"

import { Role } from "@prisma/client"

import { formatMMMd } from "@/lib/utils/date"
import ProposalCard, {
  ProposalArrow,
  ProposalMetaDataProps,
  ProposalTextContent,
  ProposalBadge,
  ProposalBadgeType,
} from "@/components/proposals/proposalsPage/components/ProposalCard"

export function RoleRow({ role, rounded }: { role: Role; rounded: boolean }) {
  const isActive =
    role.startAt &&
    role.endAt &&
    new Date() >= new Date(role.startAt) &&
    new Date() <= new Date(role.endAt)
  const isUpcoming = role.startAt && new Date() < new Date(role.startAt)

  return (
    <ProposalCard rounded={rounded} href={`/governance/roles/${role.id}`}>
      <ProposalBadge
        type={
          isActive
            ? ProposalBadgeType.now
            : isUpcoming
            ? ProposalBadgeType.soon
            : ProposalBadgeType.past
        }
      />
      <ProposalTextContent title={role.title} />
      <div className="hidden md:block">
        <ProposalMetaData
          startDate={formatMMMd(role.startAt || new Date())}
          endDate={formatMMMd(role.endAt || new Date())}
        />
      </div>
      <ProposalArrow
        href={`/governance/roles/${role.id}`}
        proposalType={"SELF_NOMINATION"}
      />
    </ProposalCard>
  )
}
