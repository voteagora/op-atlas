import { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"

import { VerifiedAddressesContent } from "./content"

export const metadata: Metadata = {
  title: "Linked Wallets - OP Atlas",
  description:
    "Link and manage your wallets for ENS, attestations, and governance.",
}

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <h2 className="text-foreground text-2xl font-semibold">Linked Wallets</h2>
      <div className="text-secondary-foreground">
        Display your attestations, ENS, and more.
        <br />
        <br />
        <ul className="list-disc list-outside pl-5">
          <li>
            If you&apos;re a citizen or guest voter, please link your
            badgeholder address.
          </li>
          <li>
            If you&apos;re a Token House delegate, please link your delegate
            address.
          </li>
          <li>
            If you&apos;ve received Foundation attestations, please link the
            relevant addresses.
          </li>
          <li>
            Set a governance address—this is where you&apos;ll receive
            attestations, including the voting badge for citizens and guest
            voters.
          </li>
        </ul>
      </div>

      <VerifiedAddressesContent userId={session.user.id} />
    </div>
  )
}
