import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getAllUserRoleApplications } from "@/lib/actions/role"

import { ACTIVE_USER_APPLICATIONS_QUERY_KEY } from "./useActiveUserApplications"

export const useAllRoleApplications = ({
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
    queryFn: () => getAllUserRoleApplications(userId, organizationId),
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
