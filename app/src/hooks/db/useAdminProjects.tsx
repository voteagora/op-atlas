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
  const { data: session } = useSession()

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminProjects", session?.user.id],
    queryFn: () => getAdminProjects(session?.user.id as string),
    enabled: !!session,
  })

  return { data, isLoading, error }
}
