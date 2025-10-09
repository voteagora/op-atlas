import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const RedBadge = ({
  showIcon = false,
  text = "",
  className,
}: {
  showIcon?: boolean
  text?: string
  className?: string
}) => {
  return (
    <Badge
      className={cn(
        `text-sm font-normal text-rose-800 border-0 bg-rose-200`,
        className,
      )}
      variant={"outline"}
    >
      {showIcon && <XIcon width={12} height={12} />}
      {text}
    </Badge>
  )
}
