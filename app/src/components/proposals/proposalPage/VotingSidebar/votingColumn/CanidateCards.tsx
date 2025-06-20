"use client"

import CandidateCard from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/CandidateCard"
import { CandidateCardProps } from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/VotingColumn"
import { useState } from "react"

const CandidateCards = ({
  candidates,
}: {
  candidates: CandidateCardProps[]
}) => {
  const [selectedApprovals, setSelectedApprovals] = useState<number[] | null>(
    null,
  )
  const handleApprovalClick = (idx: number) => {
    if (selectedApprovals === null) {
      setSelectedApprovals([idx])
    } else if (selectedApprovals.includes(idx)) {
      // If the index is already in the array, remove it
      setSelectedApprovals(selectedApprovals.filter((i) => i !== idx))
      if (selectedApprovals.length === 1) {
        // If this was the last item, set to null
        setSelectedApprovals(null)
      }
    } else {
      // Add the index to the array
      setSelectedApprovals([...selectedApprovals, idx])
    }
  }
  return (
    <>
      <div className="border-t pt-3">
        <p className="pl-2 pr-2 h-5">{candidates.length} Candidates</p>
      </div>
      <div className="w-full sm:w-[272px]">
        {candidates.map((candidate, idx) => (
          <CandidateCard
            key={idx}
            img={candidate.image}
            username={candidate.name}
            organizations={candidate.organizations}
            carrotLink={candidate.buttonLink}
            selected={selectedApprovals?.includes(idx)}
            onClick={() => handleApprovalClick(idx)}
          />
        ))}
      </div>
    </>
  )
}

export default CandidateCards
