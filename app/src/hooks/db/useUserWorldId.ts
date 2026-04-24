import { UserWorldId } from "@prisma/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchUserWorldId,
  fetchUserWorldIdVerified,
} from "@/lib/actions/hookFetchers"

export const WORLD_VERIFICATION_QUERY_KEY = "worldVerification"
export const PUBLIC_WORLD_VERIFICATION_QUERY_KEY = "publicWorldVerification"

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
      return await fetchUserWorldId(id)
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

export const useUserWorldIdVerified = ({
  id,
  enabled,
}: {
  id?: string
  enabled?: boolean
}) => {
  const isEnabled = id ? enabled ?? true : false

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: [PUBLIC_WORLD_VERIFICATION_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error("User ID is required")
      return await fetchUserWorldIdVerified(id)
    },
    enabled: isEnabled,
  })

  return {
    data,
    isLoading,
    isSuccess,
    isError,
  }
}
