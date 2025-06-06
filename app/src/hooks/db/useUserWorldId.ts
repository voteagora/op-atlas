import { UserWorldId } from "@prisma/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getUserWorldId } from "@/db/users"

export const WORLD_VERIFICATION_QUERY_KEY = "worldVerification"

export const useUserWorldId = ({
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
    queryKey: [WORLD_VERIFICATION_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error("User ID is required")
      return await getUserWorldId(id)
    },
    enabled: isEnabled,
  })

  const invalidate = () => {
    if (!id) return Promise.resolve()
    return queryClient.invalidateQueries({
      queryKey: [WORLD_VERIFICATION_QUERY_KEY, id],
    })
  }

  return {
    data: data as UserWorldId,
    isLoading,
    isSuccess,
    isError,
    invalidate,
  }
}
