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
  const { data: session } = useSession()
  const voteStatus = () => {
    if (props.badge.badgeType === ProposalBadgeType.now) {
      if (!session?.user?.id) {
        return null
      }
      if (props.voted) {
        return {
          text: "You voted",
          styling: "text-success-foreground",
        }
      }
      return {
        text: "You haven't voted yet",
        styling: "text-primary",
      }
    } else if (props.badge.badgeType === ProposalBadgeType.past) {
      if (props.passed) {
        return {
          text: "Result Positive ie: Passed",
          styling: "text-success-foreground",
        }
      }

      return {
        text: "Result Negative ie: Failed",
        styling: "text-primary",
      }
    }
    return undefined
  }

  return (
    <ProposalCard rounded={props.rounded || false} href={props.arrow.href}>
      <ProposalBadge type={props.badge.badgeType} />
      <ProposalTextContent
        title={props.textContent.title}
        subtitle={props.textContent.subtitle}
      />
      <div className="hidden md:block">
        <ProposalDates
          startDate={props.dates.startDate}
          endDate={props.dates.endDate}
          voteStatus={voteStatus()}
        />
      </div>
      <ProposalArrow href={props.arrow.href} />
    </ProposalCard>
  )
}
