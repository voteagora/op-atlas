import Image from "next/image"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export function AvatarOwnerStar({ className }: { className?: string }) {
  return (
    <div className={className}>
      <HoverCard openDelay={0}>
        <HoverCardTrigger>
          <div className="p-1 rounded-full bg-white">
            <Image
              src="/assets/icons/starIcon.svg"
              width={10}
              height={10}
              alt="star"
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          side="top"
          className="w-[unset] py-2 px-3 text-xs font-medium"
        >
          Project owner
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
