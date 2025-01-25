import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getProjects } from "@/lib/actions/projects"
import { ProjectWithDetails } from "@/lib/types"

export function useUserProjects(): {
  data: ProjectWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const session = useSession()

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", session?.data?.user?.id],
    queryFn: () => getProjects(session?.data?.user?.id as string),
    enabled: session?.data?.user?.id !== undefined,
  })

  return { data, isLoading, error }
}
