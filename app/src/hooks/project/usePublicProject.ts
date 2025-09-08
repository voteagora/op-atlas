"use client"

import { useQuery } from "@tanstack/react-query"

import { getPublicProjectAction } from "@/lib/actions/projects"

export const usePublicProject = (projectId: string) => {
  return useQuery({
    queryKey: ["publicProject", projectId],
    queryFn: () => getPublicProjectAction({ projectId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!projectId,
  })
}