"use client"

import { UIProposal } from "@/components/proposals/proposal.types"
import ProposalCard, {
  ProposalArrow,
  ProposalBadge,
  ProposalBadgeType,
  ProposalMetaData,
  ProposalTextContent,
} from "@/components/proposals/proposalsPage/components/ProposalCard"

export const ProposalRow = (props: UIProposal) => {
  return (
    <ProposalCard href={props.arrow.href} >
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
