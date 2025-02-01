import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export const GreenBadge = ({
  showIcon = false,
  text = "Enrolled",
}: {
  showIcon?: boolean
  text?: string
}) => {
  return (
    <Badge
      className={`text-sm font-medium text-green-800 border-0 bg-green-100 flex gap-1`}
      variant={"outline"}
    >
      {showIcon && <Check width={12} height={12} />}
      {text}
    </Badge>
  )
}
