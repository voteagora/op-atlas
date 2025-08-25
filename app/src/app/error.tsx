"use client"

import Image from "next/image"

import ExtendedLink from "@/components/common/ExtendedLink"

export default function Error() {
  return (
    <div className="flex flex-col items-center gap-6 h-app w-full justify-center lg:px-0 px-2">
      <Image
        src={"/assets/icons/sunny-stars-custom-gimp-edit.svg"}
        alt="Sunny Logo"
        width={160}
        height={160}
      />

      <h4 className="text-black font-semibold">
        Something went wrong. Please try again later.
      </h4>

      <div className="flex flex-wrap gap-3">
        <ExtendedLink
          as="button"
          text={"Optimism"}
          href={"https://optimism.io"}
        />

        <ExtendedLink as="button" text={"Retro Funding"} href={"/"} />

        <ExtendedLink
          as="button"
          text={"Forum"}
          href={"https://gov.optimism.io"}
        />

        <ExtendedLink
          as="button"
          text={"Delegates"}
          href={"https://vote.optimism.io/delegates"}
        />
      </div>
    </div>
  )
}
