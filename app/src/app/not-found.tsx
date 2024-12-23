import OutboundArrowLink from "@/components/common/OutboundArrowLink"
import Image from "next/image"
import Link from "next/link"

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
        The page you're looking for doesn't exist.
      </h4>

      <div className="flex gap-3">
        <OutboundArrowLink
          className="bg-gray-200 pt-[10px] pb-[10px] pl-4 pr-4 rounded-lg font-medium"
          text={"Optimism"}
          target={"https://optimism.io"}
        />

        <OutboundArrowLink
          className="bg-gray-200 pt-[10px] pb-[10px] pl-4 pr-4 rounded-lg font-medium"
          text={"Retro Funding"}
          target={"/"}
        />

        <OutboundArrowLink
          className="bg-gray-200 pt-[10px] pb-[10px] pl-4 pr-4 rounded-lg font-medium"
          text={"Forum"}
          target={"https://gov.optimism.io"}
        />

        <OutboundArrowLink
          className="bg-gray-200 pt-[10px] pb-[10px] pl-4 pr-4 rounded-lg font-medium"
          text={"Delegates"}
          target={"https://vote.optimism.io/delegates"}
        />
      </div>
    </div>
  )
}
