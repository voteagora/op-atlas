"use client"

import AddGrantDeliveryAddressForm from "@/components/projects/rewards/AddGrantDeliveryAddressForm"
import { getKycTeamAction } from "@/lib/actions/projects"
import { useQuery } from "@tanstack/react-query"

export default function AddGrantDeliveryAddressContainer({
  projectId,
}: {
  projectId: string
}) {
  const { data: kycTeam } = useQuery({
    queryKey: ["kyc-teams", "project", projectId],
    queryFn: async () => {
      return getKycTeamAction(projectId)
    },
  })
  return <AddGrantDeliveryAddressForm kycTeam={kycTeam} />
}
