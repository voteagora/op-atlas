"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { isS7Citizen } from "@/lib/actions/citizens"

export const IS_S7_CITIZEN_QUERY_KEY = "is-s7-citizen"

// HOOK IS DEPRECATED. Remove after S8 voting
// We don't need to check if a user is a S7 citizen anymore

export const useIsS7Citizen = ({
  id,
  enabled = true,
}: {
  id: string
  enabled?: boolean
}) => {
  const queryClient = useQueryClient()

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: [IS_S7_CITIZEN_QUERY_KEY, id],
    queryFn: async () => {
      return await isS7Citizen(id)
    },
    enabled,
  })

  const invalidate = () => {
    return queryClient.invalidateQueries({
      queryKey: [IS_S7_CITIZEN_QUERY_KEY, id],
    })
  }

  return { data, isLoading, isSuccess, isError, invalidate }
}
