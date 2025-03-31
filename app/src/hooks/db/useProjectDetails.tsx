import { useQuery } from "@tanstack/react-query"

import { getProject } from "@/db/projects"
import { ProjectWithFullDetails } from "@/lib/types"

export function useProjectDetails(projectId: string): {
  data: ProjectWithFullDetails | undefined
  isLoading: boolean
  error: Error | null
} {
  return useQuery({
    queryKey: ["projectDetails", projectId],
    queryFn: () => getProject({ id: projectId }),
    enabled: !!projectId,
  })
}
