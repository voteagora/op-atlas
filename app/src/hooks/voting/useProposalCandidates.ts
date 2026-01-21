import { useQuery } from "@tanstack/react-query"
import mixpanel from "mixpanel-browser"

import { fetchProposalCandidates } from "@/lib/actions/hookFetchers"

type ProposalCandidate = {
  id: string
  name: string
  avatar?: string | null
  link: string
}

export const useProposalCandidates = (candidateUserIds: string[]) => {
  return useQuery({
    queryKey: ["proposal-candidates", candidateUserIds],
    queryFn: async () => {
      if (!candidateUserIds?.length) {
        return []
      }

      try {
        return (await fetchProposalCandidates(
          candidateUserIds,
        )) as ProposalCandidate[]
      } catch (error) {
        mixpanel.track("fetchProposalCandidates_error", {
          candidate_identifiers: candidateUserIds,
          message: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    },
  })
}
