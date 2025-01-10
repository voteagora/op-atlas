"use client"

import { cn } from "@/lib/utils"

export const Sidebar = ({
  className,
  applyByDate,
  startDate,
  projectsEnrolled,
}: {
  className?: string
  applyByDate: string
  startDate: string
  projectsEnrolled: number
}) => {
  const units = "0"

  const opRewarded = "25,400"
  const avgOpRewardPerProject = "450"

  return (
    <div className={cn("flex flex-col gap-y-6", className)}>
      <div className="flex flex-col items-center justify-center gap-y-3 p-6 border border-2 border-grey-900 rounded-xl">
        <p className="font-bold">Apply</p>

        <p className="text-sm text-secondary-foreground text-center">
          Apply by {applyByDate} to be evaluated for rewards starting{" "}
          {startDate}.
        </p>
      </div>

      {projectsEnrolled > 0 && (
        <div className="flex flex-col gap-y-3 p-6 border border-2 border-grey-900 rounded-xl">
          <p className="font-bold">{projectsEnrolled} projects enrolled</p>
          <div className="w-full bg-black rounded-lg h-[126px]"></div>

          <LittleSection
            title={`${units} Units`}
            description="High quality onchain value"
          />

          <LittleSection
            title={`${opRewarded} OP`}
            description="Rewarded across projects so far"
          />

          <LittleSection
            title={`${avgOpRewardPerProject} OP`}
            description="Average rewards per project"
          />
        </div>
      )}
    </div>
  )
}

function LittleSection({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex flex-col">
      <p className="font-bold">{title}</p>
      <p className="font-light text-sm">{description}</p>
    </div>
  )
}
