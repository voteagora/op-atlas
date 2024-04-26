import Image from "next/image"
import { useState } from "react"
import ExternalLink from "@/components/ExternalLink"

const WARPCAST = "https://warpcast.com/"

export function WarpcastBanner() {
  const [copied, setCopied] = useState(false)

  const onCopy = () => {
    navigator.clipboard.writeText(WARPCAST)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-accent p-4 gap-3 flex items-center rounded-xl text-accent-foreground font-medium text-sm">
      <Image
        src="/assets/icons/info-blue.svg"
        width={16.5}
        height={16.5}
        alt="Information"
      />
      <div>
        If your team members are not on Farcaster, they can{" "}
        <ExternalLink className="underline underline-offset-4" href={WARPCAST}>
          create a free account
        </ExternalLink>{" "}
        with Warpcast.
      </div>
      <button className="whitespace-nowrap" type="button" onClick={onCopy}>
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  )
}
