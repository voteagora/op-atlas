import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const WARPCAST = "https://warpcast.com/"
export function WarpcastBanner() {
  const [copied, setCopied] = useState(false)

  const onCopy = () => {
    navigator.clipboard.writeText(WARPCAST)
    setCopied(true)
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
        <Link className="underline underline-offset-4" href={WARPCAST}>
          create a free account
        </Link>{" "}
        with Warpcast.
      </div>
      <button className="whitespace-nowrap" type="button" onClick={onCopy}>
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  )
}
