import { redirect } from "next/navigation"

import { getOrganizationsWithClient } from "@/db/organizations"
import { getImpersonationContext } from "@/lib/db/sessionContext"

import { UserProfileSidebar } from "./UserProfileSidebar"

export async function ProfileSidebar() {
  const { db, userId } = await getImpersonationContext()
  if (!userId) {
    return redirect("/dashboard")
  }

  const organizations = await getOrganizationsWithClient(userId, db)

  return <UserProfileSidebar organizations={organizations} />
}
