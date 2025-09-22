import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const TOP100_QUERY_KEY = ["sc-top100"] as const

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

export function useEndorsementEligibility(roleId: number) {
  return useQuery({
    queryKey: ["sc-eligibility", roleId],
    queryFn: async () => {
      const res = await fetch(
        `/api/sc/endorsements/eligibility?roleId=${roleId}`,
        {
          cache: "no-store",
        },
      )
      if (!res.ok) return { eligible: false as const }
      return (await res.json()) as { eligible: boolean; reason?: string }
    },
    staleTime: 30_000,
  })
}

export function useEndorsementCounts(roleId: number, context: string) {
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
