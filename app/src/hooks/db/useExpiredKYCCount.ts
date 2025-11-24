import { useQuery } from "@tanstack/react-query"

import {
  fetchExpiredKycCountForOrganization,
  fetchExpiredKycCountForProject,
} from "@/lib/actions/hookFetchers"

export const EXPIRED_KYC_COUNT_PROJECT_QUERY_KEY = "expiredKYCCountProject"
export const EXPIRED_KYC_COUNT_ORGANIZATION_QUERY_KEY =
  "expiredKYCCountOrganization"

export const useExpiredKYCCountForProject = ({
  projectId,
  enabled = true,
}: {
  projectId: string
  enabled?: boolean
}) => {
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: [EXPIRED_KYC_COUNT_PROJECT_QUERY_KEY, projectId],
    queryFn: async () => {
      return await fetchExpiredKycCountForProject(projectId)
    },
    enabled: enabled && !!projectId,
    refetchInterval: 300000, // Refetch every 5 minutes (300000 ms)
  })

  return { data, isLoading, isSuccess, isError, error }
}

export const useExpiredKYCCountForOrganization = ({
  organizationId,
  enabled = true,
}: {
  organizationId: string
  enabled?: boolean
}) => {
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: [EXPIRED_KYC_COUNT_ORGANIZATION_QUERY_KEY, organizationId],
    queryFn: async () => {
      return await fetchExpiredKycCountForOrganization(organizationId)
    },
    enabled: enabled && !!organizationId,
    refetchInterval: 300000, // Refetch every 5 minutes (300000 ms)
  })

  return { data, isLoading, isSuccess, isError, error }
}
