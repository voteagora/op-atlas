import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { getAdminProjects } from "@/lib/actions/projects"
import {
  ApplicationWithDetails,
  OrganizationWithDetails,
  ProjectWithDetails,
  UserOrganizationsWithDetails,
} from "@/lib/types"
import { getUserOrganizations } from "@/lib/actions/organizations"
import { Organization } from "@prisma/client"

export function useUserOrganizations(): {
  data: UserOrganizationsWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const session = useSession()

  const { data, isLoading, error } = useQuery({
    queryKey: ["userOrganizations", session?.data?.user.id],
    queryFn: () => getUserOrganizations(session?.data?.user.id as string),
    enabled: session?.data?.user.id !== undefined,
  })

  return { data, isLoading, error }
}
