import React from "react"
import VotingCard, {
  VotingCardProps,
} from "@/app/proposals/components/VotingSidebar/votingCard/VotingCard"
import VotingColumn from "@/app/proposals/components/VotingSidebar/votingColumn/VotingColumn"
import VotingRedirect from "@/app/proposals/components/VotingSidebar/VotingRedirect"

interface VotingSidebarProps {
  className?: string
  votingCardProps: VotingCardProps
}

const VotingSidebar = ({
  className = "",
  votingCardProps,
}: VotingSidebarProps) => (
  <div className={`w-[304px] h-[792px] gap-6 flex flex-col ${className}`}>
    <div className="w-[304px] h-[648px]">
      <VotingCard {...votingCardProps} />
      <VotingColumn />
    </div>
    <VotingRedirect />
  </div>
)

export default VotingSidebar
