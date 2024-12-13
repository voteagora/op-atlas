import { cn } from "@/lib/utils"

export const Badge = ({
  className,
  textClassName,
  accent,
  size = "md",
  text,
}: {
  className?: string
  accent?: boolean
  size?: "md" | "lg"
  text: string
  textClassName?: string
}) => {
  return (
    <div
      className={cn(
        "flex items-center rounded-full",
        accent ? "bg-[#3374DB]" : "bg-backgroundSecondary",
        size === "lg" ? "px-3 py-1" : "px-2 py-0.5",
        className,
      )}
    >
      <p
        className={cn(
          "font-medium",
          size === "lg" ? "text-sm" : "text-xs",
          accent ? "text-background" : "text-secondary-foreground",
          textClassName,
        )}
      >
        {text}
      </p>
    </div>
  )
}
