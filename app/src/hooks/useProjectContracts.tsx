import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getProjects } from "@/lib/actions/projects"
import { ProjectWithDetails } from "@/lib/types"
import { getAllProjectContracts } from "@/db/projects"
import { ProjectContract } from "@prisma/client"

export function useProjectContracts(
  projectId: string,
  queryOptions?: Partial<UseQueryOptions<ProjectContract[], Error>>,
): UseQueryResult<ProjectContract[], Error> {
  const session = useSession()

  return useQuery({
    queryKey: ["projectContracts", projectId],
    queryFn: () => getAllProjectContracts({ projectId }),
    enabled: projectId !== undefined, // Default enabled logic
    ...queryOptions, // Merge custom options
  })
}
