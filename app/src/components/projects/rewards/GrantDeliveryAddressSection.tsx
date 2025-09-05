import { getLatestDraftFormAction } from "@/lib/actions/grantEligibility"
import GrantEligibilityFormButton from "@/components/grant-eligibility/GrantEligibilityFormButton"

interface GrantDeliveryAddressSectionProps {
  projectId?: string
  organizationId?: string
  isAdmin: boolean
}

export default async function GrantDeliveryAddressSection({
  projectId,
  organizationId,
  isAdmin,
}: GrantDeliveryAddressSectionProps) {
  // Get the latest draft form to resume if it exists
  const result = await getLatestDraftFormAction({
    projectId,
    organizationId,
  })
  const latestDraftForm = result.form

  return (
    <GrantEligibilityFormButton
      projectId={projectId}
      organizationId={organizationId}
      existingForm={latestDraftForm || undefined}
      isAdmin={isAdmin}
    />
  )
}