"use client"

import { cn } from "@/lib/utils"

export const Sidebar = ({
  className,
  children,
}: {
  className?: string
  children?: any
}) => {
  return (
    <div className={cn("flex flex-col gap-y-6", className)}>{children}</div>
  )
}
