import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { ProjectWithDetails } from "@/lib/types"
import { getProject } from "@/db/projects"

export function useProject(
  projectId: string,
  queryOptions?: Partial<UseQueryOptions<ProjectWithDetails | null, Error>>,
): UseQueryResult<ProjectWithDetails | null, Error> {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject({ id: projectId }),
    ...queryOptions, // Merge custom options
  })
}
