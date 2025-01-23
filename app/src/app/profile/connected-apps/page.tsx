import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { DiscordConnection } from "@/components/profile/DiscordConnection"
import { GithubConnection } from "@/components/profile/GithubConnection"
import { GovForumConnection } from "@/components/profile/GovForumConnection"
import { getUserById } from "@/db/users"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const user = await getUserById(session.user.id)

  if (!user) {
    redirect("/")
  }

  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <h2 className="text-foreground text-2xl font-semibold">Connected apps</h2>
      <DiscordConnection user={user} />
      <GithubConnection user={user} />
      <GovForumConnection user={user} />
    </div>
  )
}
