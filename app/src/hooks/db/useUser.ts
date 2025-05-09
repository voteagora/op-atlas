import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getUserById } from "@/db/users"
import { UserWithAddresses } from "@/lib/types"

export const USER_QUERY_KEY = "user"

export const useUser = ({
  id,
  enabled,
}: {
  id?: string
  enabled?: boolean
}) => {
  const queryClient = useQueryClient()

  // If id is not provided, enabled is always false
  const isEnabled = id ? enabled ?? true : false

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: [USER_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error("User ID is required")
      return (await getUserById(id)) as UserWithAddresses
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  const invalidate = () => {
    if (!id) return Promise.resolve()
    return queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, id] })
  }

  return { user: data, isLoading, isSuccess, isError, invalidate }
}
