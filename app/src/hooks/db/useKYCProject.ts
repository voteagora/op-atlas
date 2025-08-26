import { useQuery } from "@tanstack/react-query"

import { getKYCUsersByProjectId } from "@/lib/actions/kyc"

export const KYC_PROJECT_USERS_QUERY_KEY = "kycProjectUsers"

export const useKYCProject = ({
  projectId,
  enabled = true,
}: {
  projectId: string
  enabled?: boolean
}) => {
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: [KYC_PROJECT_USERS_QUERY_KEY, projectId],
    queryFn: async () => {
      return await getKYCUsersByProjectId(projectId)
    },
    enabled: enabled && !!projectId,
  })

  return { data, isLoading, isSuccess, isError, error }
}