import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { DiscordConnection } from "@/components/profile/DiscordConnection"
import { GithubConnection } from "@/components/profile/GithubConnection"
import { GovForumConnection } from "@/components/profile/GovForumConnection"
import { getUserById } from "@/db/users"
import { FarcasterConnection } from "@/components/profile/FarcasterConnection"
import Image from "next/image"
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
      <FarcasterConnection />
      <DiscordConnection />
      <div>
        <div>
          <div className="flex items-center space-x-1.5">
            <Image
              src="/assets/icons/githubIcon.svg"
              alt="Github"
              height={20}
              width={20}
            />
            <h3 className="font-semibold text-foreground">Github</h3>
          </div>
          <p className="text-secondary-foreground">
            Connect your GitHub account to show your code contributions to the
            Optimism Collective.
          </p>
        </div>

        <GithubConnection user={user} />
      </div>
      <GovForumConnection user={user} />
    </div>
  )
}
