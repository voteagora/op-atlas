import {
  QueryObserverResult,
  RefetchOptions,
  useQuery,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { getUserApplicationsForRound } from "@/lib/actions/projects"
import { ApplicationWithDetails } from "@/lib/types"
import { useEffect, useState } from "react"

export function useUserRoundApplications(roundNumber: number | undefined): {
  data: ApplicationWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
  refetch: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<ApplicationWithDetails[]>>
} {
  const { data: session } = useSession()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["userApplicationsForRound", session?.user.id],
    queryFn: () => getUserApplicationsForRound(session?.user.id!, roundNumber!),
    enabled: !!session && !!roundNumber,
  })

  // const session = useSession()

  // console.log(session.data?.user.id)
  // const [isMounted, setIsMounted] = useState<boolean>(false)

  // useEffect(() => {
  //   setIsMounted(true)

  //   return () => {
  //     setIsMounted(false)
  //   }
  // }, [])

  // const { data, isLoading, error, refetch } = useQuery({
  //   queryKey: ["userApplicationsForRound", roundNumber],
  //   queryFn: () =>
  //     getUserApplicationsForRound(
  //       session.data.user.id,
  //       roundNumber as number,
  //     ),
  //     enabled: session?.data?.user?.id !== undefined
  // })

  return { data, isLoading, error, refetch }
}
