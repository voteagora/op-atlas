import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Badge } from "@/components/common/Badge"
import { EmailConnection } from "@/components/profile/EmailConnection"
import { EmailNotificationCheckbox } from "@/components/profile/EmailNotificationCheckbox"
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
        <div className="mt-4">
          <EmailNotificationCheckbox userId={userId} />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h4 className="text-foreground text-base font-medium">
            Identity verification
          </h4>
          <Badge text="Private" size="md" />
        </div>
        <div className="mb-4 text-base text-secondary-foreground">
          This is your personal identity verification for Optimism governance
          participation (citizens, delegates). <strong>This is not part of any grant application process.</strong>
          If you need to verify your identity for a grant,
          go to your project&apos;s or organization&apos;s Grant Address page instead.
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
