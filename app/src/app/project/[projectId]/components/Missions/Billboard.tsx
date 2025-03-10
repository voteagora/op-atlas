import { EyeOff } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"

export default function Billboard() {
  return (
    <div className="overflow-hidden relative w-full rounded-lg flex flex-col items-center justify-center bg-gradient-to-b from-[#FF4B04] to-[#FF0420] space-y-6 p-12">
      <Image
        className="absolute bottom-0 right-0"
        src="/assets/images/triangle.svg"
        alt="Triangle"
        width={712}
        height={712}
      />
      <button className="absolute top-0 right-7 z-50">
        <EyeOff size={24} className="text-white" />
      </button>
      <span
        className="px-2 py-1 rounded-full bg-red-200 text-red-600 text-xs font-medium"
        z-50
      >
        Increase your impact
      </span>
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
      <Button variant="secondary" className="z-50">
        Get started
      </Button>
    </div>
  )
}
