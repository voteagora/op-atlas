import { useQuery } from "@tanstack/react-query"

import { fetchOrganizationKycTeams } from "@/lib/actions/hookFetchers"

export const ORGANIZATION_KYC_TEAM_QUERY_KEY = "organizationKycTeam"

export const useOrganizationKycTeams = ({
  organizationId,
  enabled = true,
}: {
  organizationId: string
  enabled?: boolean
}) => {
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: [ORGANIZATION_KYC_TEAM_QUERY_KEY, organizationId],
    queryFn: async () => {
      return await fetchOrganizationKycTeams(organizationId)
    },
    enabled: enabled && !!organizationId,
  })

  return { data, isLoading, isSuccess, isError, error }
}
