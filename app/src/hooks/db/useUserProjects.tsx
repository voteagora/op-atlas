import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import {
  getApplicationsForRound,
  getProjects,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"

export function useUserProjects(userId: string | undefined): {
  data: ProjectWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  console.log(userId)
  const { data, isLoading, error } = useQuery({
    queryKey: ["userProjects", userId],
    queryFn: () => getProjects(userId!),
    enabled: !!userId,
  })

  return { data, isLoading, error }
}

export function useSessionProjects(): {
  data: ProjectWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data: session } = useSession()
  return useUserProjects(session?.user.id)
}
