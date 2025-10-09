import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export const GreyBadge = ({
  showIcon = false,
  text = "Pending",
}: {
  showIcon?: boolean
  text?: string
}) => {
  return (
    <Badge
      className={`text-xs font-normal text-grey-800 border-0 bg-gray-100 flex gap-1`}
      variant={"outline"}
    >
      {showIcon && <Loader2 width={12} height={12} />}
      {text}
    </Badge>
  )
}
