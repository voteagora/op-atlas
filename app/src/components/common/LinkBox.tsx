import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

import { cn } from "@/lib/utils"

type LinkBoxProps = {
  href: string
  icon: LucideIcon
  children: ReactNode
  className?: string
  target?: string
  rel?: string
}

export function LinkBox({ href, icon: Icon, children, className, target = "_blank", rel = "noopener noreferrer" }: LinkBoxProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(
        "group flex items-center gap-3 rounded-[6px] border border-tertiary px-3 py-2 transition-colors hover:bg-tertiary",
        className,
      )}
    >
      <Icon className="h-4 w-4 text-secondary-foreground group-hover:text-secondary-foreground" />
      <span className="text-base text-secondary-foreground group-hover:text-secondary-foreground">
        {children}
      </span>
    </Link>
  )
}
