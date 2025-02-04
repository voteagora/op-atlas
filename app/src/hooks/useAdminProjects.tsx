import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import {
  getAdminProjects,
  getApplicationsForRound,
  getProjects,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"

export function useAdminProjects(): {
  data: ProjectWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const session = useSession()

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminProjects", session?.data?.user.id],
    queryFn: () => getAdminProjects(session?.data?.user.id as string),
  })

  return { data, isLoading, error }
}
