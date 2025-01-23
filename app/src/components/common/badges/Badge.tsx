import { Badge as BaseBadge } from "@/components/ui/badge"
import { Check, Loader2, XIcon } from "lucide-react"
import { ReactNode } from "react"

const icons = {
  loader: <Loader2 width={12} height={12} />,
  check: <Check width={12} height={12} />,
  X: <XIcon width={12} height={12} />,
}

const colorSchemes = {
  blue: {
    background: "bg-calloutAlternative-foreground",
    text: "text-blue-800",
  },
  green: {
    background: "bg-green-100",
    text: "text-green-800",
  },
  red: {
    background: "bg-rose-200",
    text: "text-rose-800",
  },
}
export const Badge = ({
  content = "",
  icon,
  colorScheme,
}: {
  icon?: keyof typeof icons
  content: ReactNode
  colorScheme?: keyof typeof colorSchemes
}) => {
  return (
    <BaseBadge
      className={`text-xs font-medium border-0 flex gap-1 ${
        colorScheme && colorSchemes[colorScheme].background
      } ${colorScheme && colorSchemes[colorScheme].text}`}
      variant={"outline"}
    >
      {icon && icons[icon]}
      {content}
    </BaseBadge>
  )
}
