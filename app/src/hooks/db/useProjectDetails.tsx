import { useQuery } from "@tanstack/react-query"

import { fetchProject } from "@/lib/actions/hookFetchers"
import { ProjectWithFullDetails } from "@/lib/types"

export function useProjectDetails(projectId: string): {
  data: ProjectWithFullDetails | undefined
  isLoading: boolean
  error: Error | null
} {
  return useQuery({
    queryKey: ["projectDetails", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
  })
}
