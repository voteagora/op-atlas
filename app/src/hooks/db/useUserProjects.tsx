import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getProjects } from "@/lib/actions/projects"

export function useUserProjects(userId: string | undefined): {
  data: Awaited<ReturnType<typeof getProjects>> | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ["userProjects", userId],
    queryFn: () => getProjects(userId!),
    enabled: !!userId,
  })

  return { data, isLoading, error }
}

export function useSessionProjects(): {
  data: Awaited<ReturnType<typeof getProjects>> | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data: session } = useSession()
  const viewerId =
    session?.impersonation?.targetUserId ?? session?.user?.id
  return useUserProjects(viewerId)
}
