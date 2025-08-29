import { notFound } from "next/navigation"

import { auth } from "@/auth"
import GrantEligibilityWizard from "@/components/grant-eligibility/GrantEligibilityWizard"
import { getGrantEligibilityForm } from "@/lib/actions/grantEligibility"

interface GrantEligibilityFormPageProps {
  params: {
    organizationId: string
    formId: string
  }
}

export default async function GrantEligibilityFormPage({
  params,
}: GrantEligibilityFormPageProps) {
  const session = await auth()
  
  if (!session?.user?.id) {
    notFound()
  }

  const result = await getGrantEligibilityForm(params.formId)
  
  if (result.error || !result.form) {
    notFound()
  }

  // Ensure the form belongs to this organization
  if (result.form.organizationId !== params.organizationId) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <GrantEligibilityWizard 
        form={result.form}
        organizationId={params.organizationId}
      />
    </div>
  )
}