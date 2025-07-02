import Image from "next/image"

import { Callout } from "@/components/common/Callout"

export function GrantInfoCallout({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: string
}) {
  return (
    <Callout
      type="gray"
      showIcon={false}
      className="px-6 py-4 w-full"
      leftAlignedContent={
        <div className="flex items-center">
          <Image
            alt="Info"
            src={icon}
            width={24}
            height={24}
            className="w-6 h-6 stroke-[#3374DB]"
          />

          <div className="ml-3">
            <span className="text-sm text-secondary-foreground">{title}</span>
            <span className="font-medium block">{description}</span>
          </div>
        </div>
      }
    />
  )
}
