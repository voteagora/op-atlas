import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { EmailConnection } from "@/components/profile/EmailConnection"
import { updateInteractions } from "@/lib/actions/users"
import { ProfileDetailsContent } from "./content"

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
        <EmailConnection />
      </div>
      <div className="flex flex-col gap-6">
        <div className="text-foreground text-xl font-semibold">
          Your details
        </div>
        <div>
          Most of your profile information comes from your Farcaster account. To
          edit your those details please visit Warpcast.
        </div>

        <ProfileDetailsContent session={session} />
      </div>
    </div>
  )
}
