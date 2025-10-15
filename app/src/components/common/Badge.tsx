import Image from "next/image"

import { cn } from "@/lib/utils"

interface BadgeButtonProps
  extends Omit<React.HTMLProps<HTMLButtonElement>, "size"> {
  as?: "button"
  className?: string
  accent?: boolean
  size?: "md" | "lg"
  leftIcon?: string
  text: string | React.ReactNode
  textClassName?: string
  onClick?: () => void
  tooltipText?: string
}

const ButtonBadge = ({
  className,
  accent,
  size = "md",
  leftIcon,
  text,
  textClassName,
  onClick,
  tooltipText,
  ...props
}: BadgeButtonProps) => {
  return (
    <button
      className={cn(
        "group relative flex items-center rounded-full gap-1 transition-colors",
        accent
          ? "bg-[#3374DB] hover:bg-[#2E62B7]"
          : "bg-backgroundSecondary hover:bg-backgroundSecondaryHover",
        size === "lg" ? "px-3 py-1" : "px-2 py-0.5",
        className,
      )}
      onClick={onClick}
      {...props}
      type={props.type as "button" | "submit" | "reset" | undefined}
    >
      {leftIcon && (
        <Image
          src={leftIcon}
          alt="icon"
          width={size === "lg" ? 16 : 14}
          height={size === "lg" ? 16 : 14}
        />
      )}
      <p
        className={cn(
          "font-normal",
          size === "lg" ? "text-sm" : "text-xs",
          accent ? "text-background" : "text-secondary-foreground",
          textClassName,
        )}
      >
        {text}
      </p>
      {tooltipText && (
        <span className="absolute -top-[calc(100%+4px)] -left-1/2 whitespace-nowrap rounded bg-white px-2 py-1 text-sm shadow-md opacity-0 transition-opacity group-hover:opacity-100">
          {tooltipText}
        </span>
      )}
    </button>
  )
}

interface BadgeLabelProps {
  as?: "label"
  className?: string
  accent?: boolean
  size?: "md" | "lg"
  leftIcon?: string
  text: string | React.ReactNode
  textClassName?: string
  tooltipText?: string
}

const LabelBadge = ({
  className,
  accent,
  size = "md",
  leftIcon,
  text,
  textClassName,
  tooltipText,
}: BadgeButtonProps) => {
  return (
    <div
      className={cn(
        "group relative flex items-center rounded-full space-x-2",
        accent ? "bg-[#3374DB]" : "bg-backgroundSecondary",
        size === "lg" ? "px-3 py-1" : "px-2 py-0.5",
        className,
      )}
    >
      {leftIcon && (
        <Image
          src={leftIcon}
          alt="icon"
          width={size === "lg" ? 16 : 14}
          height={size === "lg" ? 16 : 14}
        />
      )}
      <p
        className={cn(
          "font-normal",
          size === "lg" ? "text-sm" : "text-xs",
          accent ? "text-background" : "text-secondary-foreground",
          textClassName,
        )}
      >
        {text}
      </p>
      {tooltipText && (
        <span className="absolute -top-[calc(100%+4px)] -left-1/2 whitespace-nowrap rounded bg-white px-2 py-1 text-sm shadow-md opacity-0 transition-opacity group-hover:opacity-100">
          {tooltipText}
        </span>
      )}
    </div>
  )
}

type BadgeProps = BadgeButtonProps | BadgeLabelProps

export const Badge = ({ as = "label", ...props }: BadgeProps) => {
  if (as === "label") {
    return <LabelBadge {...props} />
  }
  return <ButtonBadge {...props} />
}
