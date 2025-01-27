import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getProjects } from "@/lib/actions/projects"
import { ProjectWithDetails } from "@/lib/types"

export function useUserProjects(
  queryOptions?: Partial<UseQueryOptions<ProjectWithDetails[], Error>>,
): UseQueryResult<ProjectWithDetails[], Error> {
  const session = useSession()

  return useQuery({
    queryKey: ["projects", session?.data?.user?.id],
    queryFn: () => getProjects(session?.data?.user?.id as string),
    enabled: session?.data?.user?.id !== undefined, // Default enabled logic
    ...queryOptions, // Merge custom options
  })
}
