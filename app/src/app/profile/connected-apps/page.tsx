import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Discord, Farcaster, Github, Optimism } from "@/components/icons/socials"
import { DiscordConnection } from "@/components/profile/DiscordConnection"
import { FarcasterConnection } from "@/components/profile/FarcasterConnection"
import { GithubConnection } from "@/components/profile/GithubConnection"
import { GovForumConnection } from "@/components/profile/GovForumConnection"

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
            <Farcaster className="w-5 h-5" />
            <h3 className="font-semibold text-foreground">Farcaster</h3>
          </div>
          <div className="text-secondary-foreground mb-4">
            Connect your farcaster account to import your username, bio and
            avatar.
          </div>
          <FarcasterConnection userId={session.user.id}>
            Connect
          </FarcasterConnection>
        </div>

        {/* Discord */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center space-x-1.5">
            <Discord className="w-5 h-5" />
            <h3 className="font-semibold text-foreground">Discord</h3>
          </div>
          <div className="text-secondary-foreground mb-4">
            Connect your account so anyone can find you on Discord.
          </div>
          <DiscordConnection userId={session.user.id} />
        </div>

        {/* Github */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center space-x-1.5">
            <Github className="w-5 h-5" />
            <h3 className="font-semibold text-foreground">Github</h3>
          </div>
          <div className="text-secondary-foreground mb-4">
            Connect your GitHub account to show your code contributions to the
            Optimism Collective.
          </div>
          <GithubConnection userId={session.user.id} />
        </div>

        {/* Gov Forum */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center space-x-1.5">
            <Optimism className="w-5 h-5" fill="#FF0000" />
            <h3 className="font-semibold text-foreground">
              Collective Governance Forum
            </h3>
          </div>
          <div className="text-secondary-foreground mb-4">
            Link your profile so anyone can find you on{" "}
            <a
              href="https://gov.optimism.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              gov.optimism.io
            </a>
            .
          </div>
          <GovForumConnection userId={session.user.id} />
        </div>
      </div>
    </div>
  )
}
