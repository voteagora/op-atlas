import Image from "next/image"

import { Callout } from "../../../common/Callout"
import ExternalLink from "../../../ExternalLink"

export function NewIn2025Callout() {
  return (
    <Callout
      type="gray"
      showIcon={false}
      className="mt-10 rounded-xl"
      leftAlignedContent={
        <div className="flex gap-4 items-center p-3">
          <Image
            alt="Info"
            src={"/assets/icons/sunny-red.svg"}
            width={56}
            height={56}
            className="w-14 h-14"
          />

          <div>
            <span className="font-normal pr-1">New in 2025:</span>
            <span className="pr-1">
              The Retro Funding program is transitioning from annual rounds to
              ongoing impact evaluation and regular rewards, offering builders
              greater consistency and predictability.
            </span>
            <ExternalLink
              href={
                "https://gov.optimism.io/t/season-7-retro-funding-missions/9295/1"
              }
              className="underline"
            >
              Learn more
            </ExternalLink>
          </div>
        </div>
      }
    />
  )
}
