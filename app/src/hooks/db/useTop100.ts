import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { TOP100_QUERY_KEY } from "@/lib/constants"

export function useIsTop100() {
  return useQuery({
    queryKey: TOP100_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/sc/top100", { cache: "no-store" })
      if (!res.ok) return { top100: false }
      return (await res.json()) as { top100: boolean }
    },
    staleTime: 60_000,
  })
}

export function useApproveNominee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      context: string
      nomineeApplicationId: number
    }) => {
      const res = await fetch("/api/sc/endorsements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as { id: string }
    },
    onSuccess: () => {
      qc.invalidateQueries()
    },
  })
}

export function useEndorsementCounts(
  roleId: number,
  context: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["sc-endorsement-counts", roleId, context],
    queryFn: async () => {
      const res = await fetch(
        `/api/sc/endorsements?roleId=${roleId}&context=${encodeURIComponent(
          context,
        )}`,
        {
          cache: "no-store",
        },
      )
      if (!res.ok)
        return [] as { nomineeApplicationId: number; count: number }[]
      return (await res.json()) as {
        nomineeApplicationId: number
        count: number
      }[]
    },
    staleTime: 15_000,
    enabled: options?.enabled ?? true,
  })
}

export function useHasEndorsed(nomineeId: number, context: string) {
  return useQuery({
    queryKey: ["sc-endorsed", nomineeId, context],
    queryFn: async () => {
      const res = await fetch(
        `/api/sc/endorsements/me?nomineeId=${nomineeId}&context=${encodeURIComponent(
          context,
        )}`,
        { cache: "no-store" },
      )
      if (!res.ok) return { endorsed: false as const }
      return (await res.json()) as { endorsed: boolean }
    },
    staleTime: 10_000,
  })
}

export function useMyEndorsements(roleId: number, context: string) {
  return useQuery({
    queryKey: ["sc-endorsed-by-role", roleId, context],
    queryFn: async () => {
      const res = await fetch(
        `/api/sc/endorsements/me?roleId=${roleId}&context=${encodeURIComponent(
          context,
        )}`,
        { cache: "no-store" },
      )
      if (!res.ok) return { endorsedIds: [] as number[] }
      return (await res.json()) as { endorsedIds: number[] }
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
