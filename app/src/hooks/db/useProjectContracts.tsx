import { useQuery } from "@tanstack/react-query"

import { fetchProjectContracts } from "@/lib/actions/hookFetchers"
import { ProjectContracts } from "@/lib/types"

export function useProjectContracts(projectId: string): {
  data: ProjectContracts | undefined
  isLoading: boolean
  error: Error | null
} {
  return useQuery({
    queryKey: ["projectContracts", projectId],
    queryFn: () => fetchProjectContracts(projectId),
    enabled: !!projectId,
  })
}
