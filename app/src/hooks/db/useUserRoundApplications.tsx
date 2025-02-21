import {
  QueryObserverResult,
  RefetchOptions,
  useQuery,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getUserApplicationsForRound } from "@/lib/actions/projects"
import { ApplicationWithDetails } from "@/lib/types"

export function useUserRoundApplications(
  userId: string | undefined,
  roundNumber: number | undefined,
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["userApplicationsForRound", userId],
    queryFn: () => getUserApplicationsForRound(userId!, roundNumber!),
    enabled: !!userId && !!roundNumber,
  })

  return { data, isLoading, error, refetch }
}

export function useSessionRoundApplications(roundNumber: number | undefined): {
  data: ApplicationWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
  refetch: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<ApplicationWithDetails[]>>
} {
  const session = useSession()
  return useUserRoundApplications(session?.data?.user.id, roundNumber)
}
