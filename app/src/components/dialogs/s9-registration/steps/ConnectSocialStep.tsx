"use client"

import { ReactNode } from "react"

import { CheckCircle2 } from "lucide-react"

import { Button as CommonButton } from "@/components/common/Button"
import { Farcaster, Github, XOptimism } from "@/components/icons/socials"

type ConnectSocialStepProps = {
  farcasterConnected: boolean
  githubConnected: boolean
  xConnected: boolean
  onLinkFarcaster: () => void
  onLinkGithub: () => void
  onLinkTwitter: () => void
}

export function ConnectSocialStep({
  farcasterConnected,
  githubConnected,
  xConnected,
  onLinkFarcaster,
  onLinkGithub,
  onLinkTwitter,
}: ConnectSocialStepProps) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-3">
        <SocialRow
          icon={<Farcaster className="w-4 h-4" />}
          name="Farcaster"
          connected={farcasterConnected}
          onConnect={onLinkFarcaster}
        />
        <SocialRow
          icon={<Github className="w-4 h-4" />}
          name="GitHub"
          connected={githubConnected}
          onConnect={onLinkGithub}
        />
        <SocialRow
          icon={<XOptimism className="w-4 h-4" />}
          name="X"
          connected={xConnected}
          onConnect={onLinkTwitter}
        />
      </div>
    </div>
  )
}

type SocialRowProps = {
  icon: ReactNode
  name: string
  connected: boolean
  onConnect?: () => void
  actionLabel?: string
}

function SocialRow({
  icon,
  name,
  connected,
  onConnect,
  actionLabel = "Connect",
}: SocialRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-secondary h-[44px]">
      <div className="flex items-center gap-2 py-3 pl-3">
        <div className="flex items-center justify-center">{icon}</div>
        <span className="text-sm text-foreground">{name}</span>
      </div>
      {connected ? (
        <div className="flex items-center gap-1.5 text-sm text-secondary-foreground pr-3 py-3">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Connected</span>
        </div>
      ) : (
        <div className="pr-1.5 py-1.5">
          <CommonButton variant="secondary" onClick={onConnect} className="h-8">
            {actionLabel}
          </CommonButton>
        </div>
      )}
    </div>
  )
}
