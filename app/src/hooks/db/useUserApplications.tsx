import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getApplications } from "@/lib/actions/projects"
import { ApplicationWithDetails } from "@/lib/types"

export function useUserApplications(): {
  data: ApplicationWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data: session } = useSession()

  const { data, isLoading, error } = useQuery({
    queryKey: ["userApplications", session?.user?.id],
    queryFn: () => getApplications(session?.user?.id!),
    enabled: !!session,
  })

  return { data, isLoading, error }
}
