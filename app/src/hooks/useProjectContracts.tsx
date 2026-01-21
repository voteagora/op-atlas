import { ProjectContract } from "@prisma/client"
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"

import { fetchAllProjectContracts } from "@/lib/actions/hookFetchers"

export function useProjectContracts(
  projectId: string,
  queryOptions?: Partial<UseQueryOptions<ProjectContract[], Error>>,
): UseQueryResult<ProjectContract[], Error> {
  return useQuery({
    queryKey: ["projectContracts", projectId],
    queryFn: () => fetchAllProjectContracts(projectId),
    ...queryOptions, // Merge custom options
  })
}
