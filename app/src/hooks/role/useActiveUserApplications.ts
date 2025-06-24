"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { activeUserApplications } from "@/lib/actions/role"

export const ACTIVE_USER_APPLICATIONS_QUERY_KEY = "activeUserApplications"

export const useActiveUserApplications = ({
  userId,
  enabled = true,
}: {
  userId: string
  enabled?: boolean
}) => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: [ACTIVE_USER_APPLICATIONS_QUERY_KEY, userId],
    queryFn: () => activeUserApplications(userId),
    enabled,
  })

  const invalidate = () => {
    return queryClient.invalidateQueries({
      queryKey: [ACTIVE_USER_APPLICATIONS_QUERY_KEY, userId],
    })
  }

  return {
    data,
    isLoading,
    error,

    invalidate,
  }
}
