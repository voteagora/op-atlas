import { ChevronLeft, ChevronRight } from "lucide-react"

import {
  VoteButtonProps,
  VoteType,
} from "@/components/proposals/proposal.types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const VoteButton = ({
  textValue,
  size = "default",
  variant = "outline",
  disabled = "no",
  iconLeft = false,
  iconRight = false,
  selected = false,
  voteType,
  onClick,
}: VoteButtonProps) => {
  const isDisabled = disabled === "yes"

  // Determine custom class names based on selection and vote type
  let customClasses = ""

  // Apply selected styles based on vote type
  if (selected && voteType) {
    switch (voteType) {
      case VoteType.For:
        customClasses = "bg-success text-[#006117]"
        break
      case VoteType.Abstain:
        customClasses =
          "border border-backgroundSecondary bg-backgroundSecondary text-[#0F111A]"
        break
      case VoteType.Against:
        customClasses = "bg-[#FFD1D5] text-[#B80018]"
        break
      case VoteType.Veto:
        customClasses = "bg-[#FFD1D5] text-[#B80018]"
        break
      default:
        break
    }
  }

  // Map size values to Button component sizes
  const buttonSize = size === "veto" ? "default" : size

  // Size-specific classes
  const sizeClasses = {
    sm: "w-[60px] h-[32px] py-[8px] px-[12px] text-sm",
    default: "w-[80px] h-[40px] py-[10px] px-[16px]",
    lg: "w-[100px] h-[48px] py-[12px] px-[20px] text-lg",
    veto: "w-[256px] h-[2.5rem] py-[10px] px-[16px]",
  }

  return (
    <Button
      variant={variant === "filled" ? "default" : "outline"}
      size={buttonSize}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        customClasses,
        "gap-[5px] flex items-center justify-center focus:outline-none focus:ring-0 focus:ring-offset-0",
      )}
    >
      {iconLeft && <ChevronLeft className="mr-1" size={16} />}
      <span className="text-center text-sm">{textValue}</span>
      {iconRight && <ChevronRight className="ml-1" size={16} />}
    </Button>
  )
}

export default VoteButton
