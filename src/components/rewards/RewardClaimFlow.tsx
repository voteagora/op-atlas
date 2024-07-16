"use client"

import { ArrowUpRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"

import { RewardWithProject } from "@/lib/types"
import { cn } from "@/lib/utils"

import ExternalLink from "../ExternalLink"
import { StarIcon } from "../icons/star"
import { Button } from "../ui/button"
import { ClaimForm } from "./ClaimForm"
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
        <ClaimForm reward={reward} />

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

          <ExternalLink
            href={`https://optimismfnd.typeform.com/to/wTJYUOSd#projectid=${reward.projectId}`}
          >
            <Button variant="secondary" className="">
              Take 4 minute survey
              <ArrowUpRight size={16} className="ml-2.5" />
            </Button>
          </ExternalLink>
        </div>
      </div>

      <div>
        <p className="text-center text-secondary-foreground text-sm">
          Need help?{" "}
          <ExternalLink
            href="https://plaid-cement-e44.notion.site/Retro-Funding-Grant-claiming-FAQ-3eeb66a7dbca48479bc41ef09a164b0e?pvs=4"
            className="font-medium"
          >
            View frequently asked questions
          </ExternalLink>{" "}
          or{" "}
          <ExternalLink
            href="mailto:retrofunding@optimism.io"
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
