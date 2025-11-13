import {
  fetchCitizenByAddress,
  fetchCitizenForUser,
} from "@/lib/actions/hookFetchers"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useWallet } from "../useWallet"

export const USER_CITIZEN_QUERY_KEY = "citizen"
export const USER_CITIZEN_BY_ADDRESS_QUERY_KEY = "citizen-by-address"

export const useUserCitizen = () => {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const viewerId =
    session?.impersonation?.targetUserId ?? session?.user?.id
  useEffect(() => {
    if (viewerId) {
      queryClient.invalidateQueries({
        queryKey: [USER_CITIZEN_QUERY_KEY, viewerId],
      })
    }
  }, [viewerId, queryClient])

  const {
    data: citizen,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: [USER_CITIZEN_QUERY_KEY, viewerId],
    queryFn: async () => {
      if (!viewerId) {
        return null
      } else {
        return await fetchCitizenForUser(viewerId)
      }
    },
    enabled: !!viewerId,
  })

  return { citizen, isLoading, isSuccess, isError }
}

export const useUserByAddress = (address: string | null) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (address) {
      queryClient.invalidateQueries({
        queryKey: [USER_CITIZEN_BY_ADDRESS_QUERY_KEY, address],
      })
    }
  }, [address, queryClient])

  const {
    data: citizen,
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: [USER_CITIZEN_BY_ADDRESS_QUERY_KEY, address],
    queryFn: async () => {
      if (!address) {
        return null
      } else {
        return await fetchCitizenByAddress(address)
      }
    },
    enabled: !!address,
  })

  return { citizen, isLoading, isSuccess, isError }
}

export const useUserByContext = () => {
  const { currentAddress } = useWallet()
  const { citizen, isLoading, isSuccess, isError } =
    useUserByAddress(currentAddress)
  return { citizen, isLoading, isSuccess, isError }
}
