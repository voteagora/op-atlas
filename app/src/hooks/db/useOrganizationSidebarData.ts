import { useQuery } from "@tanstack/react-query"
import { Organization } from "@prisma/client"

import { getOrganizationKycTeamsAction } from "@/lib/actions/organizations"
import { resolveProjectStatus } from "@/lib/utils/kyc"

export const ORGANIZATION_SIDEBAR_DATA_QUERY_KEY = "organizationSidebarData"

export type OrganizationSidebarData = {
  organization: Organization
  incompleteProject: any | null
  organizationUrl: string
  isLinkActive: boolean
  isGrantAddressActive: boolean
}

export const useOrganizationSidebarData = ({
  organizations,
  pathname,
  enabled = true,
}: {
  organizations?: Organization[]
  pathname: string
  enabled?: boolean
}) => {
  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: [ORGANIZATION_SIDEBAR_DATA_QUERY_KEY, organizations?.map(o => o.id), pathname],
    queryFn: async (): Promise<OrganizationSidebarData[]> => {
      if (!organizations) return []

      const orgData = await Promise.all(
        organizations.map(async (organization) => {
          const organizationUrl = `profile/organizations/${organization.id}`
          const isLinkActive = pathname.includes(organizationUrl)
          const isGrantAddressActive = pathname.includes(
            `${organizationUrl}/grant-address`,
          )

          // Fetch organization KYC teams
          const organizationKycTeams = await getOrganizationKycTeamsAction({
            organizationId: organization.id,
          })

          const projects = organizationKycTeams.flatMap(
            (org) => org.team.projects,
          )

          // Determine organization completeness based on TAM users (across the org's KYC teams)
          const tamUsers = organizationKycTeams.flatMap((org) =>
            (org.team.team || []).flatMap((t: any) => t.users || []),
          )
          const orgResolvedStatus =
            tamUsers && tamUsers.length > 0
              ? resolveProjectStatus(tamUsers)
              : "PENDING"

          // If org TAM users indicate incomplete status, show the incomplete card by associating it with a representative project
          // We pick the first available project as a handle for the IncompleteCard component
          const incompleteProject =
            orgResolvedStatus === "PENDING" ||
            orgResolvedStatus === "project_issue"
              ? projects[0] || null
              : null

          return {
            organization,
            incompleteProject,
            organizationUrl,
            isLinkActive,
            isGrantAddressActive,
          }
        }),
      )

      return orgData
    },
    enabled: enabled && !!organizations,
  })

  return { data: data || [], isLoading, isSuccess, isError, error }
}