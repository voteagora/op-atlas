import { Sora } from "next/font/google"
import Image from "next/image"

import { RewardWithProject } from "@/lib/types"
import { cn, formatNumber } from "@/lib/utils"

const sora = Sora({ subsets: ["latin"] })

export function SocialShareImage({ reward }: { reward: RewardWithProject }) {
  return (
    <div
      className={cn(
        "flex flex-col w-[600px] h-[300px] relative pt-[27px] px-[29px] pb-[20px] gap-10",
        sora.className,
      )}
      style={{
        backgroundImage: "url(/assets/images/social-share-background.png)",
        backgroundSize: "cover",
      }}
    >
      <Image
        className="z-10"
        src="/assets/images/optimism-wordmark.png"
        width={135}
        height={19}
        alt="Optimism"
      />
      <div className="flex gap-5 items-center">
        <div
          className="rounded-[19px] overflow-hidden p-[3.17px]"
          style={{
            background: "linear-gradient(180deg, #FF0420 0%, #8935DE 100%)",
          }}
        >
          {reward.project.thumbnailUrl && (
            <Image
              className="rounded-[15.83px]"
              src={reward.project.thumbnailUrl}
              height={90}
              width={90}
              alt="Project thumbnail"
            />
          )}
        </div>
        <div className="flex flex-col flex-1">
          <div className="text-[20px] text-[#8D33DB] tracking-tighter">
            {reward.project.name}
          </div>
          <div
            style={{
              backgroundImage:
                "linear-gradient(90deg, #8D33DB 0%, #523EFF 100%)",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: "45px",
            }}
            className="text-[45px] font-semibold text-[#8D33DB] tracking-tighter"
          >
            {/* @ts-expect-error Next converts Decimal to number bc Server Components suck */}
            {formatNumber(reward.amount)} OP
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div
          className="text-[18px] tracking-tighter font-semibold"
          style={{
            backgroundImage: "linear-gradient(90deg, #8D33DB 0%, #523EFF 100%)",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Retro Funding Round 4
        </div>
        <div
          className="text-[24px] tracking-tighter font-semibold -mt-2"
          style={{
            backgroundImage: "linear-gradient(90deg, #8D33DB 0%, #523EFF 100%)",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Onchain Builders
        </div>
      </div>
    </div>
  )
}
