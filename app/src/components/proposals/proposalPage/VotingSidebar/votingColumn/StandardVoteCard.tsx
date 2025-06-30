"use client"

import { VoteType } from "@/components/proposals/proposal.types"
import VoteButton from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/VoteButton"

interface standardVoteCardProps {
  selectedVote?: VoteType
  setSelectedVote: (vote: VoteType) => void
}

const StandardVoteCard = ({
  selectedVote,
  setSelectedVote,
}: standardVoteCardProps) => {
  return (
    <div className={"gap-[8px] flex items-center justify-center"}>
      <VoteButton
        textValue={VoteType.For}
        voteType={VoteType.For}
        selected={selectedVote === VoteType.For}
        onClick={() => setSelectedVote(VoteType.For)}
      />
      <VoteButton
        textValue={VoteType.Abstain}
        voteType={VoteType.Abstain}
        selected={selectedVote === VoteType.Abstain}
        onClick={() => setSelectedVote(VoteType.Abstain)}
      />
      <VoteButton
        textValue={VoteType.Against}
        voteType={VoteType.Against}
        selected={selectedVote === VoteType.Against}
        onClick={() => setSelectedVote(VoteType.Against)}
      />
    </div>
  )
}

export default StandardVoteCard
