import React from "react"

import {
  VotingCardProps,
  VotingColumnProps,
  VotingRedirectProps,
} from "@/components/proposals/proposal.types"

import VotingColumn from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/VotingColumn"
import VotingRedirect from "@/components/proposals/proposalPage/VotingSidebar/VotingRedirect"
import VotingCard from "@/components/proposals/proposalPage/VotingSidebar/votingCard/VotingCard"

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
