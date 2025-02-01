import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { getApplicationsForRound } from "@/lib/actions/projects"
import { ApplicationWithDetails } from "@/lib/types"

export function useRoundApplications(roundNumber: number | undefined): {
  data: ApplicationWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ["applicationsForRound", roundNumber],
    queryFn: () => getApplicationsForRound(roundNumber as number),
    enabled: roundNumber !== undefined,
  })

  return { data, isLoading, error }
}
