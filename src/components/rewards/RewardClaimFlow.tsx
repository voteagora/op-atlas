"use client"

import { ArrowDownToLine, ArrowUpRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"

import { RewardWithProject } from "@/lib/types"
import { cn } from "@/lib/utils"

import ExternalLink from "../ExternalLink"
import { StarIcon } from "../icons/star"
import { Button } from "../ui/button"
import { ClaimForm } from "./ClaimForm"
import ClaimHeader from "./ClaimHeader"
import { ShareImage } from "./ShareImage"

const RewardClaimFlow = ({
  className,
  isUserAdmin,
  reward,
}: {
  reward: RewardWithProject
  isUserAdmin: boolean
  className?: string
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { status } = useSession()

  if (status === "loading") {
    return null
  }

  const downloadImage = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/og/rewards/${reward.id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `reward-${reward.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading image:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-y-18", className)}>
      <div className="flex flex-col gap-y-12 w-full bg-background border rounded-3xl p-16">
        {/* Header */}
        <ClaimHeader reward={reward} isUserAdmin={isUserAdmin} />

        {/* Claim form */}
        <ClaimForm reward={reward} />

        <StarIcon className="mx-auto" />

        {/* Share image */}
        {reward.roundId === "5" && (
          <>
            <div className="flex flex-col items-center border rounded-2xl p-10 gap-6">
              <h4 className="font-semibold text-xl">Share your achievement</h4>
              <div className="border border-border rounded-xl overflow-hidden w-[640px] h-[360px]">
                <ShareImage
                  name={reward.project.name}
                  amount={Number(reward.amount)}
                  thumbnailUrl={reward.project.thumbnailUrl}
                />
              </div>

              <Button variant="secondary" onClick={downloadImage}>
                {isLoading ? "Downloading..." : "Download image"}
                <ArrowDownToLine size={16} className="ml-2.5" />
              </Button>
            </div>
            <StarIcon className="mx-auto" />
          </>
        )}

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
            href="https://share.hsforms.com/1PNoDrBhtR2CHm3HwbB577Aqoshb"
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
