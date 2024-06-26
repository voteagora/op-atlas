import { cn } from "@/lib/utils"

import { BadgeholderIcon } from "../icons/badgeholderIcon"

export const Badgeholder = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-red-200 px-2 py-0.5 rounded-full",
        className,
      )}
    >
      <BadgeholderIcon />
      <p className="text-xs text-destructive">Badgeholder</p>
    </div>
  )
}
