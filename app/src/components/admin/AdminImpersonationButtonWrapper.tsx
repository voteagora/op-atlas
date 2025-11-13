/**
 * Server Component Wrapper for AdminImpersonationButton
 * Checks if user is admin before rendering the button
 */

import { getImpersonationContext } from "@/lib/db/sessionContext"
import { isAdminUser } from "@/lib/auth/adminConfig"
import { AdminImpersonationButton } from "./AdminImpersonationButton"

export async function AdminImpersonationButtonWrapper() {
  const { session } = await getImpersonationContext()

  // Don't show if not logged in
  if (!session?.user?.id) {
    return null
  }

  // Don't show if already impersonating (button is in the banner instead)
  if (session.impersonation?.isActive) {
    return null
  }

  // Check if user is admin
  const showAdminButton = await isAdminUser(session.user.id)

  if (!showAdminButton) {
    return null
  }

  return <AdminImpersonationButton />
}
