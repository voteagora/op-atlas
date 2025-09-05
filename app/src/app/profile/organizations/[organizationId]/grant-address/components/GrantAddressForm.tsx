"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import React from "react"

import GrantEligibilityFormButton from "@/components/grant-eligibility/GrantEligibilityFormButton"
import { getLatestDraftFormAction } from "@/lib/actions/grantEligibility"

interface GrantAddressFormProps {
  hasExistingVerifiedAddresses?: boolean
  isAdmin?: boolean
}

export default function GrantAddressForm({ hasExistingVerifiedAddresses = false, isAdmin = true }: GrantAddressFormProps) {
  const params = useParams()
  const organizationId = params.organizationId as string
  
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

  if (isLoadingDraft) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-gray-200 rounded-md h-10 w-48" />
      </div>
    )
  }

  // Determine button variant: use "add" only if there are existing verified addresses
  const buttonVariant = hasExistingVerifiedAddresses ? "add" : "default"

  return (
    <div className="space-y-6">
      <GrantEligibilityFormButton 
        organizationId={organizationId}
        existingForm={latestDraftForm || undefined}
        variant={buttonVariant}
        isAdmin={isAdmin}
      />
    </div>
  )
}
