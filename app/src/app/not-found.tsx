import Image from "next/image"

import Link from "@/components/common/Link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 h-app w-full justify-center lg:px-0 px-2">
      <Image
        src={"/assets/icons/sunny-stars-custom-gimp-edit.svg"}
        alt="Sunny Logo"
        width={160}
        height={160}
      />

      <h4 className="text-black font-semibold">
        The page you&apos;re looking for doesn&apos;t exist.
      </h4>

      <div className="flex flex-wrap gap-3">
        <Link as="button" text={"Optimism"} href={"https://optimism.io"} />

        <Link as="button" text={"Retro Funding"} href={"/"} />

        <Link as="button" text={"Forum"} href={"https://gov.optimism.io"} />

        <Link
          as="button"
          text={"Delegates"}
          href={"https://vote.optimism.io/delegates"}
        />
      </div>
    </div>
  )
}
