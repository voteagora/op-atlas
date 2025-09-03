"use client"

import { useQuery } from "@tanstack/react-query"

import { verifyMembership } from "@/lib/actions/utils"

export const useMembership = (projectId: string, userId?: string) => {
  return useQuery({
    queryKey: ["membership", projectId, userId],
    queryFn: async () => {
      if (!userId) return { isMember: false }

      const result = await verifyMembership(projectId, userId)
      return {
        isMember: !result?.error,
        error: result?.error || null,
      }
    },
    enabled: !!userId && !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}