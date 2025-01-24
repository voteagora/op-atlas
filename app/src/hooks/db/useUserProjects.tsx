import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import {
  getApplicationsForRound,
  getProjects,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"

export function useUserProjects(roundNumber: number | undefined): {
  data: ProjectWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const session = useSession()

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", roundNumber],
    queryFn: () => getProjects(session?.data?.user.id as string),
    enabled: session?.data?.user.id !== undefined,
  })

  return { data, isLoading, error }
}
