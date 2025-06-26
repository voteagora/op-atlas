import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getUserAdminProjectsWithDetail } from "@/db/projects"
import { UserProjectsWithDetails } from "@/lib/types"

export const USER_ADMIN_PROJECTS_QUERY_KEY = "userAdminProjects"

export const useUserAdminProjects = ({
  userId,
  enabled,
}: {
  userId: string
  enabled?: boolean
}) => {
  const queryClient = useQueryClient()

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: [USER_ADMIN_PROJECTS_QUERY_KEY, userId],
    queryFn: async () => {
      return (await getUserAdminProjectsWithDetail({
        userId,
      })) as UserProjectsWithDetails | null
    },
    enabled: enabled ?? true,
  })

  const invalidate = () => {
    return queryClient.invalidateQueries({
      queryKey: [USER_ADMIN_PROJECTS_QUERY_KEY, userId],
    })
  }

  return { data, isLoading, isSuccess, isError, invalidate }
}
