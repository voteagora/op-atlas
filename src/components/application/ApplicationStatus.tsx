import { cn } from "@/lib/utils"

import { CheckIconFilled } from "../icons/checkIconFilled"

export const ApplicationStatus = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-x-4 p-6 border rounded-2xl",
        className,
      )}
    >
      <CheckIconFilled />
      <div className="flex flex-col">
        <p className="font-medium">Retro Funding Round 4: Onchain Builders</p>
        <p className="text-secondary-foreground">Applied, March 31, 4:12 PM</p>
      </div>
    </div>
  )
}
