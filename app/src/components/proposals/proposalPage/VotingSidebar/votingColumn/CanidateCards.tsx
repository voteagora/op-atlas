"use client"

import { VoteType } from "@/components/proposals/proposal.types"
import CandidateCard from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/CandidateCard"
import { Skeleton } from "@/components/ui/skeleton"
import { useProposalCandidates } from "@/hooks/voting/useProposalCandidates"

interface CandidateCardsProps {
  candidateIds: { name?: string; id: string }[]
  selectedVote?: { voteType: VoteType; selections?: number[] }
  setSelectedVote: (vote: { voteType: VoteType; selections?: number[] }) => void
  votingDisabled?: boolean
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
  candidateIds,
  selectedVote,
  setSelectedVote,
  votingDisabled,
}: CandidateCardsProps) => {
  // Extract just the IDs for the hook
  const candidateIdsArray = candidateIds.map((candidate) => candidate.id)

  // Create a map of ID to name for later use
  const idToNameMap = candidateIds.reduce((map, candidate) => {
    if (candidate.name) {
      map[candidate.id] = candidate.name
    }
    return map
  }, {} as Record<string, string>)

  const { data: fetchedCandidates, isLoading: areCandidatesLoading } =
    // Pass only the IDs to the hook
    useProposalCandidates(candidateIdsArray)

  if (areCandidatesLoading) {
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

  if (!fetchedCandidates) return null

  // Merge the provided names with the fetched candidates
  const candidates = fetchedCandidates.map((candidate) => {
    if (idToNameMap[candidate.id]) {
      return {
        ...candidate,
        name: idToNameMap[candidate.id],
      }
    }
    return candidate
  })

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
      <div className="align-left w-full p-2">
        <p className="h-5 font-normal text-[16px] leading-6 md:text-[14px] md:leading-5 text-foreground align-middle">
          {candidates.length} candidates
        </p>
      </div>
      <div className="candidate-card-container mb-2 w-full sm:w-[272px] sm:max-h-[344px] overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">

        {candidates.map((candidate, idx) => (
          <CandidateCard
            key={idx}
            candidate={candidate}
            selectedVote={selectedVote?.selections?.includes(idx) || false}
            setSelectedVote={() => handleApprovalClick(idx)}
            votingDisabled={votingDisabled}
          />
        ))}
      </div>
    </>
  )
}

export default CandidateCards
