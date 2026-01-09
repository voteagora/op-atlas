import { Metadata } from "next"
import { redirect } from "next/navigation"

import {
  Discord,
  Farcaster,
  Github,
  Optimism,
  World,
  XOptimism,
} from "@/components/icons/socials"
import { DiscordConnection } from "@/components/profile/DiscordConnection"
import { FarcasterConnection } from "@/components/profile/FarcasterConnection"
import {
  GithubConnection,
  GithubNotDeveloperToggle,
} from "@/components/profile/GithubConnection"
import { GovForumConnection } from "@/components/profile/GovForumConnection"
import { WorldConnection } from "@/components/profile/WorldIdConnection"
import { XConnection } from "@/components/profile/XConnection"
import { getImpersonationContext } from "@/lib/db/sessionContext"

export const metadata: Metadata = {
  title: "Connected Apps - OP Atlas",
  description:
    "Connect apps like Farcaster, Discord, GitHub, and Governance Forum.",
}

export default async function Page() {
  const { session, userId } = await getImpersonationContext()
  if (!userId) {
    redirect("/")
  }
  const isImpersonating = !!session?.impersonation?.isActive

  return (
    <div className="flex flex-col gap-12 text-secondary-foreground">
      <h2 className="text-foreground text-2xl font-semibold">Connected Apps</h2>
      {isImpersonating && (
        <p className="text-sm text-muted-foreground">
          You&apos;re viewing another user, so connections are read-only.
        </p>
      )}

      <div className="flex flex-col gap-8">
        {/* Farcaster */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Farcaster className="w-5 h-5 text-foreground" />
              <h3 className="font-medium text-foreground text-base">
                Farcaster
              </h3>
            </div>
            <div className="text-secondary-foreground text-base">
              Connect your Farcaster account to import your username, bio, and
              avatar.
            </div>
          </div>
          <div className="flex-shrink-0 self-center">
            <FarcasterConnection userId={userId} readOnly={isImpersonating}>
              Connect
            </FarcasterConnection>
          </div>
        </div>

        {/* Discord */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Discord className="w-5 h-5 text-foreground" />
              <h3 className="font-medium text-foreground text-base">Discord</h3>
            </div>
            <div className="text-secondary-foreground text-base">
              Connect your account so anyone can find you on Discord.
            </div>
          </div>
          <div className="flex-shrink-0 self-center">
            <DiscordConnection userId={userId} readOnly={isImpersonating} />
          </div>
        </div>

        {/* Github */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Github className="w-5 h-5 text-foreground" />
              <h3 className="font-medium text-foreground text-base">GitHub</h3>
            </div>
            <div className="text-secondary-foreground text-base">
              Connect your GitHub account to show your code contributions.
            </div>
            {!isImpersonating && (
              <GithubNotDeveloperToggle userId={userId} />
            )}
          </div>
          <div className="flex-shrink-0 self-center">
            <GithubConnection
              userId={userId}
              hideNotDeveloperToggle
              readOnly={isImpersonating}
            />
          </div>
        </div>

        {/* Gov Forum */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Optimism className="w-5 h-5" fill="#FF0000" />
              <h3 className="font-medium text-foreground text-base">
                Collective Governance Forum
              </h3>
            </div>
            <div className="text-secondary-foreground text-base">
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
            <GovForumConnection userId={userId} readOnly={isImpersonating} />
          </div>
        </div>

        {/* WorldID */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <World className="w-5 h-5" />
              <h3 className="font-medium text-foreground text-base">WorldID</h3>
            </div>
            <div className="text-secondary-foreground text-base">
              Add your proof of personhood.
            </div>
          </div>
          <div className="flex-shrink-0 self-center">
            <WorldConnection userId={userId} variant="button" readOnly={isImpersonating}>
              Connect
            </WorldConnection>
          </div>
        </div>

        {/* X */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <XOptimism className="w-5 h-5" />
              <h3 className="font-medium text-foreground text-base">X</h3>
            </div>
            <div className="text-secondary-foreground text-base">
              Connect your account so anyone can find you on X.
            </div>
          </div>
          <div className="flex-shrink-0 self-center">
            <XConnection userId={userId} readOnly={isImpersonating} />
          </div>
        </div>
      </div>
    </div>
  )
}
