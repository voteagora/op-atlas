import { EyeOff } from "lucide-react"
import Image from "next/image"

import ExtendedLink from "@/components/common/ExtendedLink"

export default function IncreaseYourImpact() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center space-x-2 group">
        <h4 className="font-semibold text-xl">Increase your impact</h4>
        <button>
          <EyeOff
            size={20}
            className="opacity-0 group-hover:opacity-100 transition-all duration-150"
          />
        </button>
      </div>
      <div className="overflow-hidden relative w-full rounded-lg flex flex-col items-center justify-center bg-gradient-to-b from-[#FF4B04] to-[#FF0420] space-y-6 p-12">
        <Image
          src="/assets/icons/shining-white.svg"
          width={24}
          height={24}
          alt="Shinning Icon"
        />
        <div className="space-y-3 text-center z-50">
          <h4 className="font-semibold text-xl text-contrast-foreground">
            Make your application interopable
          </h4>
          <p className="text-contrast-foreground">
            Deploy SuperchainERC20 now to enable interoperable assets as soon as
            Superchain Interop goes live. Tap into the Superchain network effect
            from day one!
          </p>
        </div>
        <div className="z-50">
          <ExtendedLink
            as="button"
            variant="ghost"
            text="Get started in the Superchain Dev Console"
            href="https://google.com"
          />
        </div>
      </div>
    </div>
  )
}
