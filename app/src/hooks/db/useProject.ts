import { useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchProject } from "@/lib/actions/hookFetchers"

export const PROJECT_QUERY_KEY = "project"

export const useProject = ({
  id,
  enabled = true,
}: {
  id: string
  enabled?: boolean
}) => {
  const queryClient = useQueryClient()

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: [PROJECT_QUERY_KEY, id],
    queryFn: async () => {
      return await fetchProject(id)
    },
    enabled,
  })

  const invalidate = () => {
    return queryClient.invalidateQueries({ queryKey: [PROJECT_QUERY_KEY, id] })
  }

  return { data, isLoading, isSuccess, isError, invalidate }
}
