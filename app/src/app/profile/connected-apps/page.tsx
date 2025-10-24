import { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import {
  Discord,
  Farcaster,
  Github,
  Optimism,
} from "@/components/icons/socials"
import { DiscordConnection } from "@/components/profile/DiscordConnection"
import { FarcasterConnection } from "@/components/profile/FarcasterConnection"
import {
  GithubConnection,
  GithubNotDeveloperToggle,
} from "@/components/profile/GithubConnection"
import { GovForumConnection } from "@/components/profile/GovForumConnection"

export const metadata: Metadata = {
  title: "Connected Apps - OP Atlas",
  description:
    "Connect apps like Farcaster, Discord, GitHub, and Governance Forum.",
}

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <h2 className="text-foreground text-2xl font-semibold">Connected Apps</h2>

      <div className="flex flex-col gap-8">
        {/* Farcaster */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <Farcaster className="w-5 h-5 text-foreground" />
              <h3 className="font-medium text-foreground text-base">
                Farcaster
              </h3>
            </div>
            <div className="text-secondary-foreground mb-4 text-base">
              Connect your Farcaster account to import your username, bio, and
              avatar.
            </div>
          </div>
          <div className="flex-shrink-0 self-center">
            <FarcasterConnection userId={session.user.id}>
              Connect
            </FarcasterConnection>
          </div>
        </div>

        {/* Discord */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <Discord className="w-5 h-5 text-foreground" />
              <h3 className="font-medium text-foreground text-base">Discord</h3>
            </div>
            <div className="text-secondary-foreground mb-4 text-base">
              Connect your account so anyone can find you on Discord.
            </div>
          </div>
          <div className="flex-shrink-0 self-center">
            <DiscordConnection userId={session.user.id} />
          </div>
        </div>

        {/* Github */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <Github className="w-5 h-5 text-foreground" />
              <h3 className="font-medium text-foreground text-base">GitHub</h3>
            </div>
            <div className="text-secondary-foreground text-base">
              Connect your GitHub account to show your code contributions.
            </div>
            <GithubNotDeveloperToggle userId={session.user.id} />
          </div>
          <div className="flex-shrink-0 self-center">
            <GithubConnection userId={session.user.id} hideNotDeveloperToggle />
          </div>
        </div>

        {/* Gov Forum */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <Optimism className="w-5 h-5" fill="#FF0000" />
              <h3 className="font-medium text-foreground text-base">
                Collective Governance Forum
              </h3>
            </div>
            <div className="text-secondary-foreground mb-4 text-base">
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
          </div>
          <div className="flex-shrink-0 self-center">
            <GovForumConnection userId={session.user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
