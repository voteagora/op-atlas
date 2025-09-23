"use client"

import ProposalCard, {
  ProposalArrow,
  ProposalBadge,
  ProposalBadgeType,
  ProposalDates,
  ProposalTextContent,
} from "@/components/proposals/proposalsPage/components/ProposalCard"

import { ProposalRow } from "./ProposalRow"
import { Role } from "@prisma/client"
import { formatMMMd } from "@/lib/utils/date"
import { ChevronRight } from "lucide-react"
import { getRolePhaseStatus } from "@/lib/utils/roles"

export interface StandardProposalProps {
  voted?: boolean
  passed?: boolean
  badge: {
    badgeType: ProposalBadgeType
  }
  textContent: {
    title: string
    subtitle?: string
  }
  dates: {
    startDate: string
    endDate: string
  }
  arrow: {
    href: string
  }
}
interface StandardProposalsProps {
  proposals: StandardProposalProps[]
  securityRoles?: Role[]
}
const Proposals = ({
  proposals,
  securityRoles = [],
}: StandardProposalsProps) => {

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="w-full font-semibold text-[20px] leading-7 align-middle text-text-default">
          Proposals
        </h4>
      </div>
      <div>
        {securityRoles.map((role, index) => (
          <SecurityPlaceholderRow
            key={`security-placeholder-${index}`}
            role={role}
          />
        ))}
        {proposals.map((proposal, index) => (
          <ProposalRow key={index} {...proposal} />
        ))}
      </div>
    </div>
  )
}

interface SecurityPlaceholderRowProps {
  role: Role
}

const SecurityPlaceholderRow = ({
  role,
}: SecurityPlaceholderRowProps) => {
    const { isVotingPhase } = getRolePhaseStatus(role)
    const proposalBadgeType = isVotingPhase
      ? ProposalBadgeType.now
      : ProposalBadgeType.soon
    const href = isVotingPhase ? `/governance/roles/${role.id}` : undefined
  return (
    <ProposalCard href={href}>
      <ProposalBadge type={proposalBadgeType} />
      <ProposalTextContent
        title={`Election For ${role.title}`}
        subtitle="Voters: Delegates"
      />
      <div className="hidden md:flex flex-col min-w-[187px] justify-end text-right text-secondary-foreground">
        <span className="text-base font-normal leading-6">
          {role.startAt && role.endAt && (
            <ProposalDates
              startDate={formatMMMd(role.voteStartAt || new Date())}
              endDate={formatMMMd(role.voteEndAt || new Date())}
            />
          )}
        </span>
      </div>
      <div className="hidden md:block w-[36px] h-[36px]" aria-hidden>
        <div className="w-full h-full rounded-[6px] flex items-center justify-center p-[6px_12px_6px_12px] bg-secondary text-text/defaul">
          <ChevronRight width={14} height={14} />
        </div>
      </div>
    </ProposalCard>
  )
}

export default Proposals
