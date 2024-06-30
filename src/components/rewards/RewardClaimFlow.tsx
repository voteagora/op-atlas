"use client"

import { ArrowUpRight } from "lucide-react"
import { useSession } from "next-auth/react"

import { RewardWithProject } from "@/lib/types"
import { cn } from "@/lib/utils"

import ExternalLink from "../ExternalLink"
import { StarIcon } from "../icons/star"
import { Button } from "../ui/button"
import ClaimHeader from "./ClaimHeader"

const RewardClaimFlow = ({
  className,
  reward,
}: {
  reward: RewardWithProject
  className?: string
}) => {
  const { status } = useSession()

  if (status === "loading") {
    return null
  }

  return (
    <div className={cn("flex flex-col gap-y-18", className)}>
      <div className="flex flex-col gap-y-12 w-full bg-background border rounded-3xl p-16">
        {/* Header */}
        <ClaimHeader reward={reward} />

        {/* Claim form */}
        <p className="mx-auto">tina form go here yay</p>

        <StarIcon className="mx-auto" />

        {/* Share image */}
        <div className="flex flex-col items-center border rounded-2xl p-10">
          <h4 className="font-semibold text-xl">Share your achievement</h4>
        </div>

        <StarIcon className="mx-auto" />

        {/* Survey */}
        <div className="flex flex-col items-center gap-6">
          <h4 className="font-semibold text-xl">
            Help make Retro Funding better
          </h4>

          {/* TODO: Add survey link */}
          <Button variant="secondary" className="">
            Take 4 minute survey
            <ArrowUpRight size={16} className="ml-2.5" />
          </Button>
        </div>
      </div>

      <div>
        <p className="text-center text-secondary-foreground text-sm">
          Need help?{" "}
          <ExternalLink
            href="https://gov.optimism.io/t/retro-funding-4-onchain-builders-round-details/7988"
            className="font-medium"
          >
            View frequently asked questions
          </ExternalLink>{" "}
          or {/* TODO: Final support link */}
          <ExternalLink
            href="https://gov.optimism.io/t/retro-funding-4-onchain-builders-round-details/7988"
            className="font-medium"
          >
            contact support
          </ExternalLink>
        </p>
      </div>
    </div>
  )
}

export default RewardClaimFlow
