import { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getPersonalKYCForUser } from "@/lib/actions/userKyc"
import PersonalKYCForm from "@/components/profile/PersonalKYCForm"
import PersonalKYCStatus from "@/components/profile/PersonalKYCStatus"

export const metadata: Metadata = {
  title: "KYC Verification - OP Atlas",
  description: "Complete your identity verification for grant eligibility",
}

export default async function KYCPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const kycResult = await getPersonalKYCForUser()
  const hasKYC = !!kycResult.kycUser

  return (
    <div className="flex flex-col gap-6 text-secondary-foreground">
      <h2 className="text-foreground text-2xl font-semibold">
        KYC Verification
      </h2>
      <div className="text-secondary-foreground">
        Complete your identity verification to unlock grant eligibility and streamline future applications.
      </div>

      {hasKYC ? (
        <PersonalKYCStatus kycUser={kycResult.kycUser!} />
      ) : (
        <PersonalKYCForm />
      )}
    </div>
  )
}