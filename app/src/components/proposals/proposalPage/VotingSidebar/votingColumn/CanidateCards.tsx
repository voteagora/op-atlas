"use client"

import CandidateCard from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/CandidateCard"
import { useMultipleUserQualifications } from "@/hooks/citizen/useMultiCitizenUser"
import { VoteType } from "@/components/proposals/proposal.types"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

interface CandidateCardsProps {
  userIds: string[]
  selectedVote?: { voteType: VoteType; selections?: number[] }
  setSelectedVote: (vote: { voteType: VoteType; selections?: number[] }) => void
}

const CandidateCardSkeleton = () => (
  <div className="w-[272px] h-10 py-2 pr-[var(--dimensions-5)] pl-[var(--dimensions-5)] rounded-[6px]">
    <div className="flex items-center h-5 gap-[8px] justify-between">
      {/* Avatar skeleton */}
      <Skeleton className="w-5 h-5 rounded-full" />

      {/* Username skeleton */}
      <Skeleton className="w-20 h-5" />

      {/* Organizations skeleton */}
      <Skeleton className="w-24 h-5" />

      {/* Approval button skeleton */}
      <Skeleton className="w-[65px] h-[24px] rounded-md" />
    </div>
  </div>
)

const CandidateCards = ({
  userIds,
  selectedVote,
  setSelectedVote,
}: CandidateCardsProps) => {
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)
  const { data: candidates, isLoading: areCandidatesLoading } =
    useMultipleUserQualifications(userIds)

  useEffect(() => {
    if (!areCandidatesLoading) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [areCandidatesLoading])

  if (isInitialLoad) {
    return (
      <>
        <div className="border-t px-2 align-left w-full">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="w-full sm:w-[272px]">
          {[...Array(3)].map((_, idx) => (
            <CandidateCardSkeleton key={idx} />
          ))}
        </div>
      </>
    )
  }

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
