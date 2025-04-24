"use client"

import AddGrantDeliveryAddressForm from "@/components/projects/rewards/AddGrantDeliveryAddressForm"
import { KYCTeamWithTeam } from "@/lib/types"

export default function AddGrantDeliveryAddressContainer({
  kycTeam,
}: {
  kycTeam?: KYCTeamWithTeam
}) {
  return <AddGrantDeliveryAddressForm kycTeam={kycTeam} />
}
