import { useQuery } from "@tanstack/react-query"

import { getPublicRoundApplicationProjects } from "@/lib/actions/projects"

export function useRoundApplications(roundNumber: number | undefined): {
  data:
    | Awaited<ReturnType<typeof getPublicRoundApplicationProjects>>
    | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ["applicationsForRound", roundNumber],
    queryFn: () => getPublicRoundApplicationProjects(roundNumber!),
    enabled: !!roundNumber,
  })

  return { data, isLoading, error }
}
