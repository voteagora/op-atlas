import { cn } from "@/lib/utils"

export const Badge = ({
  className,
  accent,
  text,
}: {
  className?: string
  accent?: boolean
  text: string
}) => {
  return (
    <div
      className={cn(
        "flex items-center px-2 py-0.5 rounded-full",
        accent ? "bg-[#3374DB]" : "bg-backgroundSecondary",
        className,
      )}
    >
      <p
        className={cn(
          "text-xs font-medium",
          accent ? "text-background" : "text-foreground",
        )}
      >
        {text}
      </p>
    </div>
  )
}
