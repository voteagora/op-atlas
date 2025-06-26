import { ChevronLeft, ChevronRight } from "lucide-react"
import { VoteType } from "@/components/proposals/proposal.types"

interface VoteButtonProps {
  textValue: string
  size?: "default" | "sm" | "lg" | "veto"
  variant?: "outline" | "filled"
  hover?: "yes" | "no"
  disabled?: "yes" | "no"
  iconLeft?: boolean
  iconRight?: boolean
  selected?: boolean
  voteType?: VoteType
  onClick?: () => void
}

const VoteButton = ({
  textValue,
  size = "default",
  variant = "outline",
  hover = "no",
  disabled = "no",
  iconLeft = false,
  iconRight = false,
  selected = false,
  voteType,
  onClick,
}: VoteButtonProps) => {
  const isDisabled = disabled === "yes"

  // Determine styles based on variant
  let variantStyles =
    variant === "outline"
      ? "border border-solid border-border bg-background"
      : "bg-button-primary text-button-primary-foreground"

  // Apply selected styles based on vote type
  if (selected && voteType) {
    switch (voteType) {
      case VoteType.For:
        variantStyles = "border border-solid border-border bg-success"
        break
      case VoteType.Abstain:
        variantStyles =
          "border border-solid border-border bg-backgroundSecondary"
        break
      case VoteType.Against:
        variantStyles =
          "border border-solid border-border bg-red-200 text-red-600"
        break
      case VoteType.Veto:
        variantStyles =
          "border border-solid border-border bg-red-200 text-red-600"
        break
      default:
        break
    }
  }

  // Determine styles based on size
  const sizeStyles = {
    sm: "w-[60px] h-[32px] py-[8px] px-[12px] text-sm",
    default: "w-[80px] h-[40px] py-[10px] px-[16px]",
    lg: "w-[100px] h-[48px] py-[12px] px-[20px] text-lg",
    veto: "w-[15rem] h-[2.5rem] y-[10px] px-[16px]",
  }

  return (
    <button
      className={`
        ${sizeStyles[size]} 
        gap-[5px] 
        rounded-[6px] 
        ${variantStyles}
        flex items-center justify-center
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${
          hover === "yes" && !isDisabled
            ? variant === "outline"
              ? "hover:bg-backgroundSecondaryHover"
              : "hover:bg-button-primary-hover"
            : ""
        }
        focus:outline-none focus:ring-0 focus:ring-offset-0
      `}
      disabled={isDisabled}
      onClick={onClick}
    >
      {iconLeft && <ChevronLeft className="mr-1" size={16} />}
      <p className="text-center">{textValue}</p>
      {iconRight && <ChevronRight className="ml-1" size={16} />}
    </button>
  )
}

export default VoteButton
