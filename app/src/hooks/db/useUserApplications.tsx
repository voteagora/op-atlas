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
  const viewerId =
    session?.impersonation?.targetUserId ?? session?.user?.id

  const { data, isLoading, error } = useQuery({
    queryKey: ["userApplications", viewerId],
    queryFn: () => getApplications(viewerId!),
    enabled: !!viewerId,
  })

  return { data, isLoading, error }
}
