import { Project } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"

import { fetchRandomProjects } from "@/lib/actions/hookFetchers"

export function useGetRandomProjects(): {
  data: Project[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ["randomProjects"],
    queryFn: () => fetchRandomProjects(),
  })

  return { data, isLoading, error }
}
