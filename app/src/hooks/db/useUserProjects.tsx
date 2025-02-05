import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import {
  getApplicationsForRound,
  getProjects,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"

export function useUserProjects(): {
  data: ProjectWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data: session } = useSession()

  const { data, isLoading, error } = useQuery({
    queryKey: ["userProjects", session?.user.id],
    queryFn: () => getProjects(session?.user.id!),
    enabled: !!session,
  })

  return { data, isLoading, error }
}
