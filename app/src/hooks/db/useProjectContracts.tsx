import { useQuery } from "@tanstack/react-query"

import { getProjectContracts } from "@/db/projects"
import { ProjectContracts } from "@/lib/types"

export function useProjectContracts(projectId: string): {
  data: ProjectContracts | undefined
  isLoading: boolean
  error: Error | null
} {
  return useQuery({
    queryKey: ["projectContracts", projectId],
    queryFn: () => getProjectContracts({ projectId }),
    enabled: !!projectId,
  })
}
