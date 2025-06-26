"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { activeUserApplications } from "@/lib/actions/role"

export const ACTIVE_USER_APPLICATIONS_QUERY_KEY = "activeUserApplications"

export const useActiveUserApplications = ({
  userId,
  organizationId,
  enabled = true,
}: {
  userId?: string
  organizationId?: string
  enabled?: boolean
}) => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: [ACTIVE_USER_APPLICATIONS_QUERY_KEY, userId, organizationId],
    queryFn: () => activeUserApplications(userId, organizationId),
    enabled,
  })

  const invalidate = () => {
    return queryClient.invalidateQueries({
      queryKey: [ACTIVE_USER_APPLICATIONS_QUERY_KEY, userId, organizationId],
    })
  }

  return {
    data,
    isLoading,
    error,

    invalidate,
  }
}
