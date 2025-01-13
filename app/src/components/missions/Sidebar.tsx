"use client"

import { cn } from "@/lib/utils"

export const Sidebar = ({
  className,
  children,
}: {
  className?: string
  applyByDate: string
  startDate: string
  projectsEnrolled: number
  units: string
  opRewarded: string
  avgOpRewardPerProject: string
  userProjectCount: number
  children?: any
}) => {
  return (
    <div className={cn("flex flex-col gap-y-6", className)}>{children}</div>
  )
}
