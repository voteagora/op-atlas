import { Metadata } from "next"
import { redirect } from "next/navigation"

import { Badge } from "@/components/common/Badge"
import { EmailConnection } from "@/components/profile/EmailConnection"
import { IdentityVerification } from "@/components/profile/IdentityVerification"
import { getUserKYCStatus } from "@/lib/actions/userKyc"
import { updateInteractions } from "@/lib/actions/users"
import { getImpersonationContext } from "@/lib/db/sessionContext"

import { ProfileDetailsContent } from "./content"

export const metadata: Metadata = {
  title: "Account Details - OP Atlas",
  description: "Manage your email, identity verification, and profile details.",
}

export default async function Page() {
  const { session, userId } = await getImpersonationContext()
  if (!userId) {
    redirect("/")
  }

  if (!session?.impersonation?.isActive) {
    updateInteractions({ userId, profileVisitCount: 1 })
  }

  // Fetch KYC status
  const kycStatus = await getUserKYCStatus(userId)

  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <div className="text-foreground text-2xl font-semibold">
        Account Details
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h4 className="text-foreground text-base font-medium">Email</h4>
          <Badge text="Private" size="md" />
        </div>
        <div className="mb-4 text-base text-secondary-foreground">
          Email is required for grants, citizenship, and identity verification.
          It should be a personal email where we can reliably reach you.
        </div>
        <EmailConnection userId={userId} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h4 className="text-foreground text-base font-medium">
            Identity verification
          </h4>
          <Badge text="Private" size="md" />
        </div>
        <div className="mb-4 text-base text-secondary-foreground">
          Complete KYC to add proof of personhood to your Atlas account.
        </div>
        <IdentityVerification userId={userId} kycUser={kycStatus.kycUser} />
      </div>
      <div className="flex flex-col gap-6">
        <ProfileDetailsContent
          session={session}
          userId={userId}
          isImpersonating={!!session?.impersonation?.isActive}
        />
      </div>
    </div>
  )
}
