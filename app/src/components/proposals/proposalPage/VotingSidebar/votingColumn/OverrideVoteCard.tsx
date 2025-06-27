"use client"

import VoteButton from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/VoteButton"
import { useState } from "react"
import { VoteType } from "@/components/proposals/proposal.types"

const OverrideVoteCard = () => {
  const vetoText = "Yes, I want to veto"

  const [selectedVeto, setSelectedVeto] = useState<boolean>(false)
  const handleVoteClick = () => {
    setSelectedVeto(!selectedVeto)
  }

  return (
    <div className={"gap-[8px] flex items-center justify-center"}>
      <VoteButton
        textValue={vetoText}
        onClick={handleVoteClick}
        selected={selectedVeto}
        size={"veto"}
        voteType={VoteType.Veto}
      />
    </div>
  )
}

export default OverrideVoteCard
