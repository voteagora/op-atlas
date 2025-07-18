"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getVoteForCitizen } from "@/db/votes"

import { useUserCitizen } from "../citizen/useUserCitizen"

const MY_VOTE_QUERY_KEY = "my-vote"

const useMyVote = (proposalId: string) => {
  const { citizen } = useUserCitizen()
  const queryClient = useQueryClient()

  const {
    data: vote,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [MY_VOTE_QUERY_KEY, proposalId, citizen?.address],
    queryFn: () => {
      if (!citizen?.id) return null
      return getVoteForCitizen(proposalId, citizen.id)
    },
    enabled: !!citizen?.id && !!citizen?.address,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [MY_VOTE_QUERY_KEY, proposalId, citizen?.address],
    })
  }

  return {
    vote,
    isLoading,
    isError,
    invalidate,
  }
}

export default useMyVote
