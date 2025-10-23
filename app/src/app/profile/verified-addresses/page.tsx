import { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"

import { VerifiedAddressesContent } from "./content"

export const metadata: Metadata = {
  title: "Linked Wallets - OP Atlas",
  description: "Link and manage your wallets for ENS, attestations, and governance.",
}

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  return (
    <div className="flex flex-col gap-6 text-secondary-foreground">
      <h2 className="text-foreground text-2xl font-semibold">Linked Wallets</h2>
      <div className="text-secondary-foreground">
        Link wallets to show ENS and attestations on your profile. Required for
        Badgeholders.
      </div>

      <VerifiedAddressesContent userId={session.user.id} />
    </div>
  )
}
