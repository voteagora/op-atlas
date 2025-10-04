import { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { EmailConnection } from "@/components/profile/EmailConnection"
import { IdentityVerification } from "@/components/profile/IdentityVerification"
import { updateInteractions } from "@/lib/actions/users"
import { getUserKYCStatus } from "@/lib/actions/userKyc"
import { Badge } from "@/components/common/Badge"

import { ProfileDetailsContent } from "./content"

export const metadata: Metadata = {
  title: "Account Details - OP Atlas",
  description:
    "Sign up on OP Atlas to vote for Citizen's House proposals, Retro Funding, and more.",
}

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  updateInteractions({ userId: session.user.id, profileVisitCount: 1 })

  // Fetch KYC status
  const kycStatus = await getUserKYCStatus(session.user.id)

  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <div className="text-foreground text-2xl font-semibold">
        Account details
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h4 className="text-foreground text-base font-medium">Email</h4>
          <Badge text="Private" className="bg-secondary text-secondary-foreground px-2 py-1" />
        </div>
        <div className="mb-4 text-base text-secondary-foreground">
          Email is required for grants, citizenship, and identity verification. It should be a personal email where we can reliably reach you.
        </div>
        <EmailConnection userId={session.user.id} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h4 className="text-foreground text-base font-medium">Identity verification</h4>
          <Badge text="Private" className="bg-secondary text-secondary-foreground px-2 py-1" />
        </div>
        <div className="mb-4 text-base text-secondary-foreground">
          Complete KYC to add proof of personhood to your Atlas account.
        </div>
        <IdentityVerification userId={session.user.id} kycUser={kycStatus.kycUser} />
      </div>
      <div className="flex flex-col gap-6">
        <ProfileDetailsContent session={session} />
      </div>
    </div>
  )
}
