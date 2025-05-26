"use client"

import Image from "next/image"

import TrackedLink from "../common/TrackedLink"

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
        <div className="flex flex-col gap-4 text-base">
          <p>Not sure which program is right for you?</p>
        </div>
      </div>
      <div>
        <TrackedLink
          href="https://t.me/+QKKpn1e3N4o2NmRh"
          eventName="get_help_footer_link_clicked"
          className="bg-white text-secondary-foreground border border-border px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors text-sm w-fit"
        >
          Get help deciding
        </TrackedLink>
      </div>
    </div>
  )
}
