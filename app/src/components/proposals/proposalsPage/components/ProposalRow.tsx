"use client"

import { StandardProposalProps } from "./Proposals"
import ProposalCard, {
  ProposalArrow,
  ProposalBadge,
  ProposalBadgeType,
  ProposalDates,
  ProposalTextContent,
} from "@/components/proposals/proposalsPage/components/ProposalCard"
import { useSession } from "next-auth/react"

export const ProposalRow = (props: StandardProposalProps) => {
  return (
    <ProposalCard rounded={props.rounded || false} href={props.arrow.href}>
      <ProposalBadge type={props.badge.badgeType} />
      <ProposalTextContent
        title={props.textContent.title}
        subtitle={props.textContent.subtitle}
        startDate={props.dates.startDate}
        endDate={props.dates.endDate}
      />
      <div className="hidden md:block">
        <ProposalDates
          startDate={props.dates.startDate}
          endDate={props.dates.endDate}
          voted={props.voted}
          badgeType={props.badge.badgeType as ProposalBadgeType}
          passed={props.passed}
        />
      </div>
      <ProposalArrow href={props.arrow.href} />
    </ProposalCard>
  )
}
