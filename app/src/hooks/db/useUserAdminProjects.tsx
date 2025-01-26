import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getAdminProjects } from "@/lib/actions/projects"
import { ProjectWithDetails } from "@/lib/types"

export function useUserAdminProjects(
  queryOptions?: Partial<UseQueryOptions<ProjectWithDetails[], Error>>,
): UseQueryResult<ProjectWithDetails[], Error> {
  const session = useSession()

  return useQuery({
    queryKey: ["adminProjects", session?.data?.user.id],
    queryFn: () => getAdminProjects(session?.data?.user.id as string),
    enabled: session?.data?.user.id !== undefined,
    ...queryOptions,
  })
}
