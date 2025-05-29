import React from "react"
import VotingCard, {
  VotingCardProps,
} from "@/app/proposals/components/VotingSidebar/VotingCard"
import VotingColumn from "@/app/proposals/components/VotingSidebar/VotingColumn"
import VotingRedirect from "@/app/proposals/components/VotingSidebar/VotingRedirect"

interface VotingSidebarProps {
  className?: string
  votingCardProps: VotingCardProps
}

const VotingSidebar = ({
  className = "",
  votingCardProps,
}: VotingSidebarProps) => (
  <div className={`flex flex-col ${className}`}>
    <VotingCard {...votingCardProps} />
    <VotingColumn />
    <VotingRedirect />
  </div>
)

export default VotingSidebar
