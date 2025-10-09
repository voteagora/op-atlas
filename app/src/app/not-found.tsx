import Image from "next/image"

import ExtendedLink from "@/components/common/ExtendedLink"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 h-app w-full justify-center lg:px-0 px-2">
      <Image
        src={"/assets/icons/sunny-stars-custom-gimp-edit.svg"}
        alt="Sunny Logo"
        width={160}
        height={160}
      />

      <h4 className="text-black font-normal">
        The page you&apos;re looking for doesn&apos;t exist.
      </h4>

      <div className="grid grid-cols-2 gap-4 justify-items-center">
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
