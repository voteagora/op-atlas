import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getApplications } from "@/lib/actions/projects"
import { ApplicationWithDetails } from "@/lib/types"
import { useEffect, useState } from "react"

export function useUserApplications(): {
  data: ApplicationWithDetails[] | undefined
  isLoading: boolean
} {
  const { data: session } = useSession()

  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["userApplications", session?.user?.id],
    })
  }, [session?.user.id])

  const { data, isLoading, error } = useQuery({
    queryKey: ["userApplications", session?.user?.id],
    queryFn: () => getApplications(session?.user?.id!),
    enabled: !!session?.user.id,
  })

  return { data, isLoading }
}
