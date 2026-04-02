"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchProjectMetrics } from "@/lib/actions/hookFetchers"

export const useProjectMetrics = (projectId: string) => {
  return useQuery({
    queryKey: ["projectMetrics", projectId],
    queryFn: () => fetchProjectMetrics(projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!projectId,
  })
}
