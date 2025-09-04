"use client"

import { useQuery } from "@tanstack/react-query"

import { getProjectMetrics } from "@/lib/oso"

export const useProjectMetrics = (projectId: string) => {
  return useQuery({
    queryKey: ["projectMetrics", projectId],
    queryFn: () => getProjectMetrics(projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!projectId,
  })
}