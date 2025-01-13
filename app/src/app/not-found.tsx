import Image from "next/image"

import OutboundArrowLink from "@/components/common/OutboundArrowLink"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 mt-64">
      <Image
        src={"/assets/icons/sunny-stars-custom-gimp-edit.png"}
        alt="Sunny Logo"
        width={160}
        height={160}
      />

      <h4 className="text-black font-semibold">
        The page you&apos;re looking for doesn&apos;t exist.
      </h4>

      <div className="flex gap-3">
        <OutboundArrowLink text={"Optimism"} target={"https://optimism.io"} />

        <OutboundArrowLink text={"Retro Funding"} target={"/"} />

        <OutboundArrowLink text={"Forum"} target={"https://gov.optimism.io"} />

        <OutboundArrowLink
          text={"Delegates"}
          target={"https://vote.optimism.io/delegates"}
        />
      </div>
    </div>
  )
}
