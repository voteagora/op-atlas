import { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"

import { VerifiedAddressesContent } from "./content"

export const metadata: Metadata = {
  title: "Profile Verified Addresses - OP Atlas",
  description:
    "Sign up on OP Atlas to vote for Citizen's House proposals, Retro Funding, and more.",
}

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  return (
    <div className="flex flex-col gap-6 text-secondary-foreground">
      <h2 className="text-foreground text-2xl font-normal">
        Verified addresses
      </h2>
      <div className="text-secondary-foreground">
        Add a proof of ownership of an Ethereum address to your public profile,
        so ENS and attestations can be displayed. Required for Badgeholders.
      </div>

      <VerifiedAddressesContent userId={session.user.id} />
    </div>
  )
}
