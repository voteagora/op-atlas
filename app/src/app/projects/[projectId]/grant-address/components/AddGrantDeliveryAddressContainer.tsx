"use client"

import { useQuery } from "@tanstack/react-query"

import AddGrantDeliveryAddressForm from "@/components/projects/rewards/AddGrantDeliveryAddressForm"
import { getKycTeamAction } from "@/lib/actions/projects"

export default function AddGrantDeliveryAddressContainer({
  projectId,
}: {
  projectId: string
}) {
  const { data: kycTeam } = useQuery({
    queryKey: ["kyc-teams", "project", projectId],
    queryFn: async () => {
      const result = await getKycTeamAction(projectId)
      if (!result || "error" in result) {
        return undefined
      }
      return result
    },
  })
  return <AddGrantDeliveryAddressForm kycTeam={kycTeam} />
}
