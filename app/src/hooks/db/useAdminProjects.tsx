import { useQuery, useQueryClient } from "@tanstack/react-query"
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
} {
  const { data: session } = useSession()

  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["adminProjects", session?.user.id],
    })
  }, [session?.user.id])

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminProjects", session?.user.id],
    queryFn: () => getAdminProjects(session?.user.id as string),
    enabled: !!session?.user.id,
  })

  return { data, isLoading }
}
