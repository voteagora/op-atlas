import { notFound } from "next/navigation"

import { auth } from "@/auth"
import GrantEligibilityWizard from "@/components/grant-eligibility/GrantEligibilityWizard"
import { getGrantEligibilityForm } from "@/lib/actions/grantEligibility"

interface PageProps {
  params: {
    formId: string
  }
}

export default async function Page({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    notFound()
  }

  const result = await getGrantEligibilityForm(params.formId)
  if (result.error || !result.form) {
    notFound()
  }

  const form = result.form

  if (form.projectId) {
    return <GrantEligibilityWizard form={form} projectId={form.projectId} />
  }
  if (form.organizationId) {
    return (
      <GrantEligibilityWizard form={form} organizationId={form.organizationId} />
    )
  }

  notFound()
}
