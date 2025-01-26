import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getApplications } from "@/lib/actions/projects"
import { ApplicationWithDetails } from "@/lib/types"

export function useUserApplications(
  queryOptions?: Partial<UseQueryOptions<ApplicationWithDetails[], Error>>,
): UseQueryResult<ApplicationWithDetails[], Error> {
  const session = useSession()

  return useQuery({
    queryKey: ["userApplications"],
    queryFn: () => getApplications(session?.data?.user.id as string),
    enabled: session?.data?.user.id !== undefined,
  })
}
