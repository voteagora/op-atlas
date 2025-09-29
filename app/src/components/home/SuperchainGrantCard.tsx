import Image from "next/image"

import { ArrowRightUp } from "@/components/icons/remix"
import { cn } from "@/lib/utils"
import { SuperchainGrant } from "@/lib/utils/otherSuperchainGrantsData"

import TrackedLink from "../common/TrackedLink"

interface SuperchainGrantCardProps {
  grant: SuperchainGrant
  className?: string
}

export const SuperchainGrantCard = ({
  grant,
  className,
}: SuperchainGrantCardProps) => {
  return (
    <TrackedLink
      href={grant.learnMoreUrl}
      target="_blank"
      eventName="Link Click"
      eventData={{
        source: "home_page",
        linkName: grant.name,
        linkUrl: grant.learnMoreUrl,
        category: "Superchain Grants",
      }}
      className={cn(
        "group relative block h-[344px] px-7 py-8 bg-background rounded-xl border border-tertiary",
        "hover:bg-secondary transition-colors cursor-pointer",
        className,
      )}
    >
      {/* Chain Badge */}
      <div className="absolute top-8 right-7">
        <div className="bg-secondary px-2 py-1 rounded-full">
          <span className="text-xs font-medium text-secondary-foreground">
            {grant.chain}
          </span>
        </div>
      </div>

      <div className="flex flex-col h-full justify-between">
        {/* Header Section */}
        <div className="flex flex-col gap-6">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary">
            <Image
              src={grant.avatar}
              alt={grant.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-2">
            <h3
              className={cn(
                "text-xl font-semibold leading-7 text-text-default group-hover:underline",
              )}
            >
              {grant.name}
            </h3>
            <p className="text-base font-normal leading-6 text-secondary-foreground">
              {grant.description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-sm font-normal leading-tight text-secondary-foreground">
            Learn more
          </span>
          <ArrowRightUp className="w-4 h-4 text-secondary-foreground" />
        </div>
      </div>
    </TrackedLink>
  )
}
