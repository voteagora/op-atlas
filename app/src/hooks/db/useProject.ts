import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getProject } from "@/db/projects"

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
      return await getProject({ id })
    },
    enabled,
  })

  const invalidate = () => {
    return queryClient.invalidateQueries({ queryKey: [PROJECT_QUERY_KEY, id] })
  }

  return { project: data, isLoading, isSuccess, isError, invalidate }
}
