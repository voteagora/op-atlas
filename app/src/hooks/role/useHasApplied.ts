"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { hasApplied } from "@/lib/actions/role"

export const HAS_APPLIED_QUERY_KEY = "hasApplied"

export const useHasApplied = ({
  userId,
  roleId,
  enabled = true,
}: {
  userId: string
  roleId: number
  enabled?: boolean
}) => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: [HAS_APPLIED_QUERY_KEY, userId, roleId],
    queryFn: () => hasApplied(userId, roleId),
    enabled,
  })

  const invalidate = () => {
    return queryClient.invalidateQueries({
      queryKey: [HAS_APPLIED_QUERY_KEY, userId, roleId],
    })
  }

  return {
    hasApplied: data ?? false,
    isLoading,
    error,

    invalidate,
  }
}
