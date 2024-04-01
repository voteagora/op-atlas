import React from "react"
import Image from "next/image"

const ApplyRetroFundingRoundInfoBanner = () => {
  return (
    <div className="bg-secondary flex items-center gap-x-4 rounded-xl p-4">
      <Image
        src="/assets/icons/applyTileIcon.svg"
        width={64}
        height={67}
        alt=""
      />
      <div>
        <h2 className="text-base font-semibold text-foreground">
          Apply for Retro Funding Round 4: Onchain Builders
        </h2>
        <p className="text-secondary-foreground">
          Submit your application by April 20
        </p>
      </div>
    </div>
  )
}

export default ApplyRetroFundingRoundInfoBanner
