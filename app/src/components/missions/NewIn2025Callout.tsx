import Image from "next/image"

import { cn } from "@/lib/utils"
import ExternalLink from "../ExternalLink"

export function NewIn2025Callout() {
  return (
    <div
      className={cn(
        "bg-rose-100 flex flex-col gap-y-6 mt-6 w-full max-w-4xl rounded-lg p-6",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Image
            src={"/assets/icons/sunny-red.svg"}
            width={56}
            height={56}
            alt="Sunny"
          />
          <div>
            <span className="text-rose-800 font-bold ">New in 2025:</span>{" "}
            <span className="text-rose-800  font-light">
              The Retro Funding program is transitioning from annual rounds to
              ongoing impact evaluation and regular rewards, offering builders
              greater consistency and predictability.
            </span>{" "}
            <ExternalLink
              href={
                "https://gov.optimism.io/t/season-7-retro-funding-missions/9295/1"
              }
            >
              <span className="text-rose-800 underline  font-light">
                Learn more
              </span>
            </ExternalLink>
          </div>
        </div>
      </div>
    </div>
  )
}
