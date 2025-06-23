"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getRole } from "@/lib/actions/role"

export const ROLE_QUERY_KEY = "role"

export const useRole = ({
  id,
  enabled = true,
}: {
  id: number
  enabled?: boolean
}) => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: [ROLE_QUERY_KEY, id],
    queryFn: () => getRole(id),
    enabled,
  })

  const invalidate = () => {
    return queryClient.invalidateQueries({
      queryKey: [ROLE_QUERY_KEY, id],
    })
  }

  return {
    data,
    isLoading,
    error,
    invalidate,
  }
}
