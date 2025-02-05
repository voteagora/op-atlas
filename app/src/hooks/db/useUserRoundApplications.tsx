import {
  QueryObserverResult,
  RefetchOptions,
  useQuery,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import {
  getProjects,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"
import { useEffect, useState } from "react"

export function useUserRoundApplications(roundNumber: number | undefined): {
  data: ApplicationWithDetails[] | undefined
  isLoading: boolean
} {
  const { data: session } = useSession()

  const [data, setData] = useState<ApplicationWithDetails[] | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function get() {
      setIsLoading(true)
      const result = await getUserApplicationsForRound(
        session?.user.id!,
        roundNumber!,
      )
      setData(result)
      setIsLoading(false)
    }

    get()
  }, [!!session])

  // const { data, isLoading, error, refetch } = useQuery({
  //   queryKey: ["userApplicationsForRound", session?.user.id],
  //   queryFn: () => getUserApplicationsForRound(session?.user.id!, roundNumber!),
  //   enabled: !!session && !!roundNumber,
  // })

  return { data, isLoading }
}
