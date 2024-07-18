"use client"

import { ArrowDownToLine, ArrowUpRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { RewardWithProject } from "@/lib/types"
import { cn } from "@/lib/utils"

import ExternalLink from "../ExternalLink"
import { StarIcon } from "../icons/star"
import { Button } from "../ui/button"
import { ClaimForm } from "./ClaimForm"
import ClaimHeader from "./ClaimHeader"
import { htmlToImageConvert, ShareImage } from "./ShareImage"

const RewardClaimFlow = ({
  className,
  reward,
}: {
  reward: RewardWithProject
  className?: string
}) => {
  const { status } = useSession()
  const [thumbnailUrl, setThumbnailUrl] = useState("")

  const onShareImage = () => {
    htmlToImageConvert()
  }

  useEffect(() => {
    const fetchImage = async (url: string): Promise<void> => {
      try {
        const response = await fetch(
          `/api/download-image?url=${encodeURIComponent(url)}`,
        )
        const data = await response.json()

        if (response.ok) {
          setThumbnailUrl(`data:image/png;base64,${data.imageData}`)
        } else {
          console.error("Failed to fetch image", data.error)
        }
      } catch (error) {
        console.error("Failed to fetch image", error)
      }
    }

    if (reward.project.thumbnailUrl) fetchImage(reward.project.thumbnailUrl)
  }, [reward.project.thumbnailUrl])

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
        <div className="flex flex-col items-center border rounded-2xl p-10 gap-6">
          <h4 className="font-semibold text-xl">Share your achievement</h4>
          <div className="border border-border rounded-xl overflow-hidden w-[640px] h-[360px]">
            <ShareImage
              name={reward.project.name}
              amount={reward.amount}
              thumbnailUrl={thumbnailUrl}
            />
          </div>

          <Button variant="secondary" onClick={onShareImage}>
            Download image
            <ArrowDownToLine size={16} className="ml-2.5" />
          </Button>
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
