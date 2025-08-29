"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import React from "react"

import GrantEligibilityFormButton from "@/components/grant-eligibility/GrantEligibilityFormButton"
import { getOrganizationKycTeamsAction } from "@/lib/actions/organizations"
import { getLatestDraftFormAction } from "@/lib/actions/grantEligibility"

export default function GrantAddressForm() {
  const params = useParams()
  const organizationId = params.organizationId as string
  
  const { data: organizationKycTeams, isLoading: isLoadingKycTeams } = useQuery({
    queryKey: ["kyc-teams", "organization", organizationId],
    queryFn: async () => {
      try {
        return await getOrganizationKycTeamsAction({ organizationId })
      } catch (error) {
        console.error("Error fetching organization KYC teams:", error)
        throw error
      }
    },
  })

  const { data: latestDraftForm, isLoading: isLoadingDraft } = useQuery({
    queryKey: ["grant-eligibility-draft", "organization", organizationId],
    queryFn: async () => {
      try {
        const result = await getLatestDraftFormAction({ organizationId })
        if (result.error) {
          throw new Error(result.error)
        }
        return result.form || null
      } catch (error) {
        console.error("Error fetching latest draft form:", error)
        throw error
      }
    },
  })

  const isLoading = isLoadingKycTeams || isLoadingDraft
  const hasKycTeams = organizationKycTeams && organizationKycTeams.length > 0

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h2>Grant Delivery Address</h2>
        <p className="text-secondary-foreground font-normal">
          Add the wallet address your rewards will be delivered to. Identity verification is required for each address.
        </p>
        <p className="text-secondary-foreground font-normal">
          Get started by submitting the grant eligibility form.
        </p>
      </div>
      <div className="space-y-6">
        {/* Show loading state */}
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
          <>
            {/* Show button to create new form or resume draft if no verified addresses */}
            {!hasKycTeams && (
              <GrantEligibilityFormButton 
                organizationId={organizationId}
                existingForm={latestDraftForm || undefined}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
