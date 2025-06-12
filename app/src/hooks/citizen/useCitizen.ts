"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getCitizen } from "@/lib/actions/citizens"
import { CitizenLookup } from "@/lib/types"

export const CITIZEN_QUERY_KEY = "citizen"

export const useCitizen = ({
  query,
  enabled = true,
}: {
  query: CitizenLookup
  enabled?: boolean
}) => {
  const queryClient = useQueryClient()

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: [CITIZEN_QUERY_KEY, query.id],
    queryFn: async () => {
      return await getCitizen(query)
    },
    enabled,
  })

  const invalidate = () => {
    return queryClient.invalidateQueries({
      queryKey: [CITIZEN_QUERY_KEY, query.id],
    })
  }

  return { data, isLoading, isSuccess, isError, invalidate }
}
