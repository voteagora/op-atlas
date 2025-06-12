import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getOrganization } from "@/db/organizations"
import { OrganizationWithDetails } from "@/lib/types"

export const ORGANIZATION_QUERY_KEY = "organization"

export const useOrganization = ({
  id,
  enabled = true,
}: {
  id: string
  enabled?: boolean
}) => {
  const queryClient = useQueryClient()

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: [ORGANIZATION_QUERY_KEY, id],
    queryFn: async () => {
      return await getOrganization({ id })
    },
    enabled,
  })

  const invalidate = () => {
    return queryClient.invalidateQueries({
      queryKey: [ORGANIZATION_QUERY_KEY, id],
    })
  }

  return { organization: data, isLoading, isSuccess, isError, invalidate }
}
