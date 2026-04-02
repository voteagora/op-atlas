import { useQuery } from "@tanstack/react-query"

import { fetchProject } from "@/lib/actions/hookFetchers"

export function useProjectDetails(projectId: string): {
  data: Awaited<ReturnType<typeof fetchProject>> | undefined
  isLoading: boolean
  error: Error | null
} {
  return useQuery({
    queryKey: ["projectDetails", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
  })
}
