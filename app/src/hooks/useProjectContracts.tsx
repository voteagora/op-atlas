import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { getAllProjectContracts } from "@/db/projects"
import { ProjectContract } from "@prisma/client"

export function useProjectContracts(
  projectId: string,
  queryOptions?: Partial<UseQueryOptions<ProjectContract[], Error>>,
): UseQueryResult<ProjectContract[], Error> {
  return useQuery({
    queryKey: ["projectContracts", projectId],
    queryFn: () => getAllProjectContracts({ projectId }),
    ...queryOptions, // Merge custom options
  })
}
