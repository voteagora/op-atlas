import { MoveUpRight } from "lucide-react"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import ExternalLink from "@/components/ExternalLink"
import { EditEmail } from "@/components/profile/EditEmail"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getUserById } from "@/db/users"
import { updateInteractions } from "@/lib/actions/users"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const [user] = await Promise.all([
    getUserById(session.user.id),
    updateInteractions({ userId: session.user.id, profileVisitCount: 1 }),
  ])

  if (!user) {
    redirect("/")
  }

  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <div className="text-foreground text-2xl font-semibold">
        Profile details
      </div>
      <EditEmail user={user} />
      <div className="flex flex-col gap-6">
        <div className="text-foreground text-xl font-semibold">
          Your details
        </div>
        <div>
          Most of your profile information comes from your Farcaster account. To
          edit your those details please visit Warpcast.
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-foreground font-medium text-sm">
            Details from Farcaster
          </div>
          <div className="border border-border rounded-xl p-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="text-foreground font-medium text-sm">Photo</div>
                <Avatar className="!w-20 !h-20">
                  <AvatarImage src={session?.user?.image || ""} alt="avatar" />
                  <AvatarFallback>{session?.user?.name}</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-foreground font-medium text-sm">Name</div>
                <Input value={user.name ?? ""} disabled />
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-foreground font-medium text-sm">
                  Username
                </div>
                <Input
                  value={user.username ? `@${user.username}` : ""}
                  disabled
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-foreground font-medium text-sm">Bio</div>
                <Input value={user.bio ?? ""} disabled />
              </div>

              <ExternalLink href="https://warpcast.com/">
                <Button className="flex items-center gap-2" variant="secondary">
                  <div>Edit on Warpcast</div> <MoveUpRight size={12} />
                </Button>
              </ExternalLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
