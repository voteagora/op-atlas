import { useQuery } from "@tanstack/react-query"

import { getKYCUsersByProjectId } from "@/db/kyc"

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
      return await getKYCUsersByProjectId({ projectId })
    },
    enabled: enabled && !!projectId,
    refetchInterval: 300000, // Refetch every 5 minutes (300000 ms)
  })

  return { data, isLoading, isSuccess, isError, error }
}
