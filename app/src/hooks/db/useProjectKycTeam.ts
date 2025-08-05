import { useQuery } from "@tanstack/react-query"

import { getKycTeamAction } from "@/lib/actions/projects"

export const PROJECT_KYC_TEAM_QUERY_KEY = "projectKycTeam"

export const useProjectKycTeam = ({
  projectId,
  enabled = true,
}: {
  projectId: string
  enabled?: boolean
}) => {
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: [PROJECT_KYC_TEAM_QUERY_KEY, projectId],
    queryFn: async () => {
      return await getKycTeamAction(projectId)
    },
    enabled: enabled && !!projectId,
  })

  return { data, isLoading, isSuccess, isError, error }
}
