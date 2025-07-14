"use client"

import ProposalCard, {
  ProposalArrow,
  ProposalBadge,
  ProposalBadgeType,
  ProposalMetaData,
  ProposalTextContent,
} from "@/components/proposals/proposalsPage/components/ProposalCard"
import { UIProposal } from "@/lib/proposals"

interface ProposalRowProps extends UIProposal {
  rounded: boolean
}

export const ProposalRow = (props: ProposalRowProps) => {
  return (
    <ProposalCard rounded={props.rounded || false} href={props.arrow.href}>
      <ProposalBadge type={props.badge.badgeType} />
      <ProposalTextContent
        title={props.textContent.title}
        subtitle={props.textContent.subtitle}
      />
      <div className="hidden md:block">
        <ProposalMetaData
          startDate={props.dates.startDate}
          endDate={props.dates.endDate}
          voted={props.voted}
          badgeType={props.badge.badgeType as ProposalBadgeType}
          passed={props.passed}
          proposalType={props.proposalType}
          proposalResults={props.proposalResults}
        />
      </div>
      <ProposalArrow href={props.arrow.href} />
    </ProposalCard>
  )
}
