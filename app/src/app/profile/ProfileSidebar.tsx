import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getOrganizations } from "@/db/organizations"

import { UserProfileSidebar } from "./UserProfileSidebar"

export async function ProfileSidebar() {
  const user = await auth()

  if (!user?.user.id) {
    return redirect("/dashboard")
  }

  const organizations = await getOrganizations(user.user.id)

  return <UserProfileSidebar organizations={organizations} />
}
