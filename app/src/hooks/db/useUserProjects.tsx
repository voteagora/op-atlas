import { useQuery, useQueryClient } from "@tanstack/react-query"
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
} {
  const { data: session } = useSession()

  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["userProjects", session?.user.id],
    })
  }, [session?.user.id])

  const { data, isLoading, error } = useQuery({
    queryKey: ["userProjects", session?.user.id],
    queryFn: () => getProjects(session?.user.id!),
    enabled: !!session?.user.id,
  })

  return { data, isLoading }
}
