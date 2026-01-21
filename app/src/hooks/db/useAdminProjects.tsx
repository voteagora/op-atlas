import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getAdminProjects } from "@/lib/actions/projects"
import { ProjectWithDetails } from "@/lib/types"

export function useAdminProjects(userId: string | undefined): {
  data: ProjectWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminProjects", userId],
    queryFn: () => getAdminProjects(userId!),
    enabled: !!userId,
  })

  return { data, isLoading, error }
}

export function useSessionAdminProjects(): {
  data: ProjectWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data: session } = useSession()

  const viewerId =
    session?.impersonation?.targetUserId ?? session?.user?.id

  return useAdminProjects(viewerId)
}
