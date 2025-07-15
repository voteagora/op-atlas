"use client"

import VoteButton from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/VoteButton"
import { VoteType } from "@/components/proposals/proposal.types"

interface overrideVoteCardProps {
  selectedVote?: VoteType
  setSelectedVote: (vote: VoteType) => void
}

const OverrideVoteCard = ({
  selectedVote,
  setSelectedVote,
}: overrideVoteCardProps) => {
  const vetoText = "Yes, I want to veto"

  return (
    <div className={"gap-[8px] flex items-center justify-center"}>
      <VoteButton
        textValue={vetoText}
        onClick={() => setSelectedVote(VoteType.Against)}
        selected={selectedVote === VoteType.Against}
        size={"veto"}
        voteType={VoteType.Veto}
      />
    </div>
  )
}

export default OverrideVoteCard
