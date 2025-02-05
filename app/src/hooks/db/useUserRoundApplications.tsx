import {
  QueryObserverResult,
  RefetchOptions,
  useQuery,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getUserApplicationsForRound } from "@/lib/actions/projects"
import { ApplicationWithDetails } from "@/lib/types"

export function useUserRoundApplications(roundNumber: number | undefined): {
  data: ApplicationWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
  refetch: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<ApplicationWithDetails[]>>
} {
  const session = useSession()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["userApplicationsForRound", roundNumber],
    queryFn: () =>
      getUserApplicationsForRound(
        session?.data?.user.id as string,
        roundNumber as number,
      ),
  })

  return { data, isLoading, error, refetch }
}
