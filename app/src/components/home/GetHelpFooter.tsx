"use client"

import Image from "next/image"
import { Button } from "../ui/button"

export const GetHelpFooter = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-secondary rounded-lg p-8">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Image
          src="/assets/images/thinking-emoji-animated.gif"
          alt="OP"
          width={48}
          height={48}
        />
        <div className="flex flex-col gap-4">
          <text>Not sure which program is right for you?</text>
        </div>
      </div>
      <div>
        <Button
          variant="outline"
          onClick={() => {
            window.open("https://t.me/+QKKpn1e3N4o2NmRh", "_blank")
          }}
        >
          Get help deciding
        </Button>
      </div>
    </div>
  )
}
