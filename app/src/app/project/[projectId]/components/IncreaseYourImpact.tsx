import { EyeOff } from "lucide-react"
import Image from "next/image"

import ExtendedLink from "@/components/common/ExtendedLink"

interface IncreaseYourImpactProps {
  type: "onchain-builders" | "dev-tooling"
}
export default function IncreaseYourImpact({ type }: IncreaseYourImpactProps) {
  const isOnchainBuilder = type === "onchain-builders"
  const isDevTooling = type === "dev-tooling"
  return (
    <div className="overflow-hidden relative w-full rounded-lg flex flex-col items-center justify-center bg-gradient-to-b from-[#FF4B04] to-[#FF0420] space-y-6 p-12">
      <Image
        src="/assets/icons/shining-white.svg"
        width={24}
        height={24}
        alt="Shinning Icon"
      />
      <div className="space-y-3 text-center z-50">
        <h4 className="font-semibold text-xl text-contrast-foreground">
          {isOnchainBuilder && "Make your application interopable"}
          {isDevTooling &&
            "Support developers in building interopable applications"}
        </h4>
        <p className="text-contrast-foreground">
          {isOnchainBuilder &&
            "Deploy SuperchainERC20 now to enable interoperable assets as soon as Superchain Interop goes live. Tap into the Superchain network effect from day one!"}
          {isDevTooling && "Prepare your Dev Tooling application for interop."}
        </p>
      </div>
      <div className="z-50">
        {isOnchainBuilder && (
          <ExtendedLink
            as="button"
            variant="ghost"
            text="Get started in the Superchain Dev Console"
            href="https://console.optimism.io/getting-started"
          />
        )}
        {isDevTooling && (
          <ExtendedLink
            as="button"
            variant="ghost"
            text="Read Interop Docs"
            href="https://docs.optimism.io/stack/interop/explainer"
          />
        )}
      </div>
    </div>
  )
}
