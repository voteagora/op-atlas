import React from "react"
import VotingCard, {
  VotingCardProps,
} from "@/app/proposals/components/VotingSidebar/votingCard/VotingCard"
import VotingColumn, {
  VotingColumnProps,
} from "@/app/proposals/components/VotingSidebar/votingColumn/VotingColumn"
import VotingRedirect, {
  VotingRedirectProps,
} from "@/app/proposals/components/VotingSidebar/VotingRedirect"

interface VotingSidebarProps {
  className?: string
  votingCardProps: VotingCardProps
  votingColumnProps: VotingColumnProps
  votingRedirectProps?: VotingRedirectProps
}

const VotingSidebar = ({
  className = "",
  votingCardProps,
  votingColumnProps,
  votingRedirectProps,
}: VotingSidebarProps) => (
  <div className={`w-[304px] gap-6 flex flex-col ${className}`}>
    <div className="w-[304px] ">
      <VotingCard {...votingCardProps} />
      <VotingColumn {...votingColumnProps} />
      <div className="mt-5">
        {votingRedirectProps && <VotingRedirect {...votingRedirectProps} />}
      </div>
    </div>
  </div>
)

export default VotingSidebar
