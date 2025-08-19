import { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { EmailConnection } from "@/components/profile/EmailConnection"
import { updateInteractions } from "@/lib/actions/users"

import { ProfileDetailsContent } from "./content"

export const metadata: Metadata = {
  title: "Profile Details - OP Atlas",
  description:
    "Sign up on OP Atlas to vote for Citizen's House proposals, Retro Funding, and more.",
}

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  updateInteractions({ userId: session.user.id, profileVisitCount: 1 })

  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <div className="text-foreground text-2xl font-semibold">
        Profile details
      </div>
      <div className="flex flex-col gap-6">
        <h4 className="text-h4">Email</h4>
        <div>
          Please add an email for important messages. This is required to apply
          for and receive Retro Funding. It should be a personal email where we
          can reliably reach you. Don&apos;t worry, we&apos;ll keep it private.
        </div>
        <EmailConnection userId={session.user.id} />
      </div>
      <div className="flex flex-col gap-6">
        <ProfileDetailsContent session={session} />
      </div>
    </div>
  )
}
