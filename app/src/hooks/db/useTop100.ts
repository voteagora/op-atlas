"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useApproveNominee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      context: string
      nomineeApplicationId: number
    }) => {
      const res = await fetch("/api/sc/endorsements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as { id: number }
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}

export function useHasEndorsed(nomineeId: number, context: string) {
  return useQuery<{ endorsed: boolean }>({
    queryKey: ["sc", "endorsements", "me", context, nomineeId],
    queryFn: async () => {
      const url = `/api/sc/endorsements/me?context=${encodeURIComponent(
        context,
      )}&nomineeId=${nomineeId}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as { endorsed: boolean }
    },
    staleTime: 10_000,
  })
}
export function useRemoveEndorsement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      context: string
      nomineeApplicationId: number
    }) => {
      const url = `/api/sc/endorsements?context=${encodeURIComponent(
        params.context,
      )}&nomineeId=${params.nomineeApplicationId}`
      const res = await fetch(url, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as { removed: number }
    },
    onSuccess: () => {
      qc.invalidateQueries()
    },
  })
}
