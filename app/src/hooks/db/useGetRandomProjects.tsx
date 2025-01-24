import { Project } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"

import { getRandomProjects } from "@/db/projects"

export function useGetRandomProjects(): {
  data: Project[] | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ["randomProjects"],
    queryFn: () => getRandomProjects(),
  })

  return { data, isLoading, error }
}
