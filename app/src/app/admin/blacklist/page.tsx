import { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { isAdminUser, isImpersonationEnabled } from "@/lib/auth/adminConfig"
import { BlacklistManagement } from "@/components/admin/BlacklistManagement"

export const metadata: Metadata = {
  title: "Blacklist Management - OP Atlas Admin",
  description: "Manage blacklisted projects.",
}

export default async function AdminBlacklistPage() {
  // Check if admin features are enabled
  if (!isImpersonationEnabled()) {
    redirect("/")
  }

  // Get session and verify admin access
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/")
  }

  const isAdmin = await isAdminUser(userId)

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="h-full bg-secondary flex flex-1 px-6">
      <div className="flex flex-col w-full max-w-5xl mx-auto my-12 gap-6">
        <h1 className="text-foreground text-2xl font-semibold">
          Blacklist Management
        </h1>
        <div className="card p-6">
          <BlacklistManagement />
        </div>
      </div>
    </div>
  )
}
