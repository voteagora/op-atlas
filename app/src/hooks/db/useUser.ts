import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getUserByAddress, getUserById } from "@/db/users"
import { UserWithAddresses } from "@/lib/types"
import { UserAddress } from "@prisma/client"

export const USER_QUERY_KEY = "user"
export const USER_ADDRESSES_QUERY_KEY = "user-addresses"

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

export const useUserAddresses = ({
  address,
  enabled,
}: {
  address?: string
  enabled?: boolean
}) => {
  const queryClient = useQueryClient()

  // If id is not provided, enabled is always false
  const isEnabled = address ? enabled ?? true : false

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: [USER_ADDRESSES_QUERY_KEY, address],
    queryFn: async () => {
      if (!address) throw new Error("User Address is required")
      return await getUserByAddress(address)
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  const invalidate = () => {
    if (!address) return Promise.resolve()
    return queryClient.invalidateQueries({ queryKey: [USER_ADDRESSES_QUERY_KEY, address] })
  }

  return { user: data, isLoading, isSuccess, isError, invalidate }
}

