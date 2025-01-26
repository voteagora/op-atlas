import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { UserOrganizationsWithDetails } from "@/lib/types"
import { getUserOrganizations } from "@/lib/actions/organizations"

export function useUserOrganizations(
  queryOptions?: Partial<
    UseQueryOptions<UserOrganizationsWithDetails[] | undefined, Error>
  >,
): UseQueryResult<UserOrganizationsWithDetails[] | undefined, Error> {
  const session = useSession()

  return useQuery({
    queryKey: ["userOrganizations", session?.data?.user.id],
    queryFn: () => getUserOrganizations(session?.data?.user.id as string),
    enabled: session?.data?.user.id !== undefined,
    ...queryOptions,
  })
}
