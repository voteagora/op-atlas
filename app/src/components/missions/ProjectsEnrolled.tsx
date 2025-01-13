"use client"

import { cn } from "@/lib/utils"

export const ProjectsEnrolled = ({
  className,
  projectsEnrolled,
  units,
  opRewarded,
  avgOpRewardPerProject,
}: {
  className?: string
  projectsEnrolled: number
  units: string
  opRewarded: string
  avgOpRewardPerProject: string
}) => {
  return (
    <div className={cn("flex flex-col gap-y-6", className)}>
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
