"use client"

import { useQuery } from "@tanstack/react-query"

import { getProjectMembershipStatus } from "@/lib/actions/projects"

export const useMembership = (projectId: string, userId?: string) => {
  return useQuery({
    queryKey: ["membership", projectId, userId],
    queryFn: async () => {
      if (!userId) return { isMember: false }
      return getProjectMembershipStatus(projectId, userId)
    },
    enabled: !!userId && !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
