import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { GithubConnection } from "@/components/profile/GithubConnection"
import { getUser } from "@/lib/actions/users"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const user = await getUser(session.user.id)

  if (!user) {
    redirect("/")
  }

  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <h2 className="text-foreground text-2xl font-semibold">Connected apps</h2>
      <GithubConnection user={user} />
    </div>
  )
}
