import { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getPersonalKYCForUser } from "@/lib/actions/userKyc"
import PersonalKYCForm from "@/components/profile/PersonalKYCForm"
import PersonalKYCStatus from "@/components/profile/PersonalKYCStatus"
import FindMyKYC from "@/components/profile/FindMyKYC"

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
        <div className="flex flex-col gap-6">
          <FindMyKYC />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or start a new verification
              </span>
            </div>
          </div>
          <PersonalKYCForm />
        </div>
      )}
    </div>
  )
}