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

  return (
    <div className="flex flex-col gap-6 text-secondary-foreground">
      <h2 className="text-foreground text-2xl font-semibold">Connected apps</h2>

      <div className="flex flex-col gap-12">
        {/* Farcaster */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center space-x-1.5">
            <Image
              src="/assets/icons/farcaster-icon.svg"
              alt="Farcaster"
              height={20}
              width={20}
            />
            <h3 className="font-semibold text-foreground">Farcaster</h3>
          </div>
          <div className="text-secondary-foreground mb-4">
            Connect your farcaster account to import your username, bio and avatar.
          </div>
          <FarcasterConnection userId={session.user.id} />
        </div>

        {/* Discord */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center space-x-1.5">
            <Image
              src="/assets/icons/discordIcon.svg"
              alt="Discord"
              height={20}
              width={20}
            />
            <h3 className="font-semibold text-foreground">Discord</h3>
          </div>
          <div className="text-secondary-foreground mb-4">
            Connect your account so anyone can find you on Discord.
          </div>
          <DiscordConnection userId={session.user.id} />
        </div>

        {/* Github */}
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

          <GithubConnection userId={session.user.id} />
        </div>
        {/* TODO: Add GovForumConnection */}
        {/* <GovForumConnection user={user} /> */}
      </div>
    </div>
  )
}
