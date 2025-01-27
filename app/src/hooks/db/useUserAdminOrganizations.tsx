import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getProjects } from "@/lib/actions/projects"
import {
  OrganizationWithDetails,
  OrganizationWithTeamAndProjects,
  ProjectWithDetails,
  UserOrganizationsWithDetails,
} from "@/lib/types"
import { getAdminOrganizations } from "@/db/organizations"
import { Organization, UserOrganization } from "@prisma/client"
import { OrganizationMetadata } from "@/lib/utils/metadata"

export function useUserAdminOrganizations(
  queryOptions?: Partial<UseQueryOptions<any, Error>>,
): UseQueryResult<any, Error> {
  const session = useSession()

  return useQuery({
    queryKey: ["projects", session?.data?.user?.id],
    queryFn: () => getAdminOrganizations(session?.data?.user?.id as string),
    enabled: session?.data?.user?.id !== undefined, // Default enabled logic
    ...queryOptions, // Merge custom options
  })
}
