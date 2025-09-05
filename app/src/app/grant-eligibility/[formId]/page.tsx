import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import GrantEligibilityWizard from "@/components/grant-eligibility/GrantEligibilityWizard"
import { getGrantEligibilityForm } from "@/lib/actions/grantEligibility"
import { getUserProjectRole, getUserOrganizationRole } from "@/lib/actions/utils"

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

  const userId = session.user.id

  const result = await getGrantEligibilityForm(params.formId)
  if (result.error || !result.form) {
    notFound()
  }

  const form = result.form

  // Check admin permissions and redirect non-admins
  if (form.projectId) {
    const userRole = await getUserProjectRole(form.projectId, userId)
    if (userRole !== "admin") {
      redirect(`/projects/${form.projectId}/grant-address`)
    }
    return <GrantEligibilityWizard form={form} projectId={form.projectId} />
  }
  if (form.organizationId) {
    const userRole = await getUserOrganizationRole(form.organizationId, userId)
    if (userRole !== "admin") {
      redirect(`/profile/organizations/${form.organizationId}/grant-address`)
    }
    return (
      <GrantEligibilityWizard form={form} organizationId={form.organizationId} />
    )
  }

  notFound()
}
