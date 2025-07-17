"use client"

import { useProposalCandidates } from "@/hooks/voting/useProposalCandidates"

import { CandidateResult } from "./CandidateResult"

export const CandidateResults = ({
  results,
}: {
  results: { id: string; name?: string; value: number }[]
}) => {
  // Extract just the IDs for the hook
  const resultIds = results.map((result) => result.id)

  // Create a map of ID to name for later use
  const idToNameMap = results.reduce((map, result) => {
    if (result.name) {
      map[result.id] = result.name
    }
    return map
  }, {} as Record<string, string>)

  const { data: fetchedCandidates, isLoading } =
    useProposalCandidates(resultIds)

  if (!fetchedCandidates || isLoading) return null

  // Merge the provided names with the fetched candidates
  const candidates = fetchedCandidates.map((candidate, index) => {
    if (idToNameMap[candidate.id]) {
      return {
        ...candidate,
        name: idToNameMap[candidate.id],
      }
    }
    return candidate
  })

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
