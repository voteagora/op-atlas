"use client"

import { useProposalCandidates } from "@/hooks/voting/useProposalCandidates"

import { CandidateResult } from "./CandidateResult"

export const CandidateResults = ({
  results,
}: {
  results: { id: string; value: number }[]
}) => {
  const { data: candidates, isLoading } = useProposalCandidates(
    results.map((result) => result.id),
  )

  if (!candidates || isLoading) return null

  return (
    <>
      <div className="w-full sm:w-[272px]">
        {candidates.map((candidate, idx) => (
          <CandidateResult
            key={idx}
            value={results[idx].value}
            candidate={candidate}
          />
        ))}
      </div>
    </>
  )
}
