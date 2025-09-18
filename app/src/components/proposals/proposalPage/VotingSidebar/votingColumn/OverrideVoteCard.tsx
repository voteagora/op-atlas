"use client"

import { VoteType } from "@/components/proposals/proposal.types"
import VoteButton from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/VoteButton"

interface overrideVoteCardProps {
  selectedVote?: VoteType
  setSelectedVote: (vote: VoteType) => void
}

const OverrideVoteCard = ({
  selectedVote,
  setSelectedVote,
}: overrideVoteCardProps) => {
  return (
    <div className={"gap-[8px] flex items-center justify-center"}>
      <VoteButton
        textValue={"Veto"}
        onClick={() => setSelectedVote(VoteType.Against)}
        selected={selectedVote === VoteType.Against}
        size={"veto"}
        voteType={VoteType.Veto}
      />
      <VoteButton
        textValue={"No veto"}
        onClick={() => setSelectedVote(VoteType.Abstain)}
        selected={selectedVote === VoteType.Abstain}
        size={"veto"}
        voteType={VoteType.Veto}
      />
    </div>
  )
}

export default OverrideVoteCard
