import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import {
  getApplicationsForRound,
  getUserApplicationsForRound,
} from "@/lib/actions/projects"
import { ApplicationWithDetails } from "@/lib/types"

export function useUserRoundApplications(roundNumber: number | undefined): {
  data: ApplicationWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const session = useSession()

  const { data, isLoading, error } = useQuery({
    queryKey: ["userApplicationsForRound", roundNumber],
    queryFn: () =>
      getUserApplicationsForRound(
        session?.data?.user.id as string,
        roundNumber as number,
      ),
    enabled: session?.data?.user.id !== undefined && roundNumber !== undefined,
  })

  return { data, isLoading, error }
}
