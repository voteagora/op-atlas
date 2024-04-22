import React from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"

const ApplyRetroFundingRoundInfoBanner = ({
  className,
}: {
  className?: string
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-x-4 border rounded-xl p-4",
        className,
      )}
    >
      <Image
        alt=""
        src="/assets/icons/applyTileIcon.svg"
        width={64}
        height={67}
      />
      <div className="flex flex-col">
        <p className="font-semibold">
          Apply for Retro Funding Round 4: Onchain Builders
        </p>
        <p className="text-secondary-foreground">
          The deadline for submissions is May 31
        </p>
      </div>
      <Link href="/application" className="ml-auto">
        <Button variant="destructive">Apply</Button>
      </Link>
    </div>
  )
}

export default ApplyRetroFundingRoundInfoBanner
