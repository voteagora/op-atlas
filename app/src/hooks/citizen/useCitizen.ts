"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getCitizenByUserId } from "@/lib/actions/citizens"

export const CITIZEN_QUERY_KEY = "citizen"

export const useCitizen = ({
  userId,
  enabled = true,
}: {
  userId: string
  enabled?: boolean
}) => {
  const queryClient = useQueryClient()

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: [CITIZEN_QUERY_KEY, userId],
    queryFn: async () => {
      return await getCitizenByUserId(userId)
    },
    enabled,
  })

  const invalidate = () => {
    return queryClient.invalidateQueries({
      queryKey: [CITIZEN_QUERY_KEY, userId],
    })
  }

  return { data, isLoading, isSuccess, isError, invalidate }
}
