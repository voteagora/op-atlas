import {
  QueryObserverResult,
  RefetchOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import {
  getProjects,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"
import { useEffect, useState } from "react"

export function useUserRoundApplications(roundNumber: number | undefined): {
  data: ApplicationWithDetails[] | undefined
  isLoading: boolean
} {
  const { data: session } = useSession()

  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["userApplicationsForRound", session?.user.id],
    })
  }, [session?.user.id])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["userApplicationsForRound", session?.user.id],
    queryFn: () => getUserApplicationsForRound(session?.user.id!, roundNumber!),
    enabled: !!session?.user.id && !!roundNumber,
  })

  return { data, isLoading }
}
