import { ArrowUpRightIcon } from "lucide-react"
import Image from "next/image"

import { Callout } from "../../../common/Callout"
import ExternalLink from "../../../ExternalLink"

export function DocumentCallout({
  text,
  href,
}: {
  text: string
  href: string
}) {
  return (
    <ExternalLink href={href}>
      <Callout
        type="info"
        showIcon={false}
        className="mt-10 py-2"
        leftAlignedContent={
          <div className="flex gap-4 items-center">
            <Image
              alt="Info"
              src={"/assets/icons/doc-icon.svg"}
              width={10}
              height={10}
              className="w-5 h-5"
            />

            <p className="text-sm">{text}</p>
          </div>
        }
        rightAlignedContent={
          <div className="flex items-center gap-1 ml-auto shrink-0 text-sm font-normal">
            <ArrowUpRightIcon width={16} height={16} />
          </div>
        }
      />
    </ExternalLink>
  )
}
