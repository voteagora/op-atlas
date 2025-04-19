"use client"

import { useQuery } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { useParams } from "next/navigation"
import React from "react"

import { Button } from "@/components/common/Button"
import AddGrantDeliveryAddressForm from "@/components/projects/rewards/AddGrantDeliveryAddressForm"
import { getOrganizationKycTeamsAction } from "@/lib/actions/organizations"

export default function GrantAddressForm() {
  const params = useParams()
  const organizationId = params.organizationId as string
  const { data: organizationKycTeams, isLoading } = useQuery({
    queryKey: ["kyc-teams", "organization", organizationId],
    queryFn: async () => {
      return await getOrganizationKycTeamsAction({ organizationId })
    },
  })

  const [addMoreActive, setAddMoreActive] = React.useState(false)

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
        <h3>Verified addresses</h3>
        {isLoading ? (
          <div className="p-6 border rounded-md space-y-6 w-full h-[356px]">
            <div className="animate-pulse bg-gray-200 rounded-md h-8 w-full" />
            <div className="space-y-4">
              <div className="animate-pulse bg-gray-200 rounded-md h-[146px] w-full" />
              <div className="animate-pulse bg-gray-200 rounded-md h-8 w-full" />
              <div className="animate-pulse bg-gray-200 rounded-md h-8 w-full" />
            </div>
          </div>
        ) : (
          organizationKycTeams?.map((organizationKycTeam) => (
            <AddGrantDeliveryAddressForm
              key={organizationKycTeam.id}
              kycTeam={organizationKycTeam.team}
            />
          ))
        )}
        {(organizationKycTeams?.length === 0 || addMoreActive) && (
          <AddGrantDeliveryAddressForm />
        )}
        <Button
          variant="secondary"
          disabled={addMoreActive}
          leftIcon={<PlusIcon size={16} />}
          onClick={() => setAddMoreActive(true)}
        >
          Add more
        </Button>
      </div>
    </div>
  )
}
