"use client"

import { useQuery } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { useParams } from "next/navigation"
import React from "react"

import { Button } from "@/components/common/Button"
import AddGrantDeliveryAddressForm from "@/components/projects/rewards/AddGrantDeliveryAddressForm"
import { getOrganizationKycTeamsAction } from "@/lib/actions/organizations"

export default function GrantAddress() {
  const params = useParams()
  const { data: organizationKycTeams } = useQuery({
    queryKey: ["kyc-teams", "organization", params.organizationId],
    queryFn: async () => {
      const organizationId = params.organizationId as string
      return await getOrganizationKycTeamsAction({ organizationId })
    },
  })

  const [addMoreActive, setAddMoreActive] = React.useState(false)

  const getValidUntil = (createdAt: Date) => {
    return new Date(
      new Date(createdAt).setFullYear(new Date(createdAt).getFullYear() + 1),
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h2>Grant Delivery Address</h2>
        <p className="text-secondary-foreground font-normal">
          Add the address(es) your rewards will be delivered to. You can do this
          at any time, and your entry will be valid for one year.
        </p>
        <p className="text-secondary-foreground font-normal">
          KYC (identity verification) is required for each address.
        </p>
      </div>
      <div className="space-y-6">
        <h3>Your grant delivery addresses</h3>
        {organizationKycTeams?.map((organizationKycTeam) => (
          <AddGrantDeliveryAddressForm
            key={organizationKycTeam.id}
            userInOrganization
            kycTeam={{
              grantAddress: {
                address: organizationKycTeam.grantAddress.address,
                validUntil: getValidUntil(
                  organizationKycTeam.grantAddress.createdAt,
                ),
              },
              team: organizationKycTeam.team,
            }}
          />
        ))}
        {(organizationKycTeams?.length === 0 || addMoreActive) && (
          <AddGrantDeliveryAddressForm userInOrganization />
        )}
        <Button
          variant="secondary"
          leftIcon={<PlusIcon size={16} />}
          onClick={() => setAddMoreActive(true)}
        >
          Add more
        </Button>
      </div>
    </div>
  )
}
