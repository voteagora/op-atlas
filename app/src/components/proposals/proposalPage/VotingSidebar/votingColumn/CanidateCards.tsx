"use client"

import CandidateCard from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/CandidateCard"
import { useMultipleUserQualifications } from "@/hooks/citizen/useMultiCitizenUser"
import { VoteType } from "@/components/proposals/proposal.types"

interface CandidateCardsProps {
  userIds: string[]
  selectedVote?: { voteType: VoteType; selections?: number[] }
  setSelectedVote: (vote: { voteType: VoteType; selections?: number[] }) => void
}

const CandidateCards = ({
  userIds,
  selectedVote,
  setSelectedVote,
}: CandidateCardsProps) => {
  const { data: candidates } = useMultipleUserQualifications(userIds)

  if (!candidates) return null

  console.log({ candidates })

  const handleApprovalClick = (idx: number) => {
    const currentSelections = selectedVote?.selections || []
    let newSelections: number[]

    if (currentSelections.includes(idx)) {
      // Remove the index if it's already selected
      newSelections = currentSelections.filter((i) => i !== idx)
    } else {
      // Add the index to the array
      newSelections = [...currentSelections, idx]
    }

    // Update the parent state with the new vote
    setSelectedVote({
      voteType: VoteType.Approval,
      selections: newSelections,
    })
  }

  return (
    <>
      <div className="border-t px-2 align-left w-full">
        <p className="h-5 font-medium text-[14px] leading-5 text-foreground align-middle">
          {candidates.length} Candidates
        </p>
      </div>
      <div className="w-full sm:w-[272px]">
        {candidates.map((candidate, idx) => (
          <CandidateCard
            key={idx}
            user={candidate.user!}
            qualification={candidate.qualification!}
            selectedVote={selectedVote?.selections?.includes(idx) || false}
            setSelectedVote={() => handleApprovalClick(idx)}
          />
        ))}
      </div>
    </>
  )
}

export default CandidateCards
