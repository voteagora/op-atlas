"use client"

import { formatNumber } from "@/lib/utils"
import Image from "next/image"

export const EnrolledProjectsCard = ({
  units,
  opRewarded,
  avgOpRewardPerProject,
  projects,
}: {
  projects?: { icon: string | null; opReward: number }[]
  units?: string
  opRewarded?: number
  avgOpRewardPerProject?: number
}) => {
  return (
    <div>
      {projects && projects.length > 0 && (
        <div className="flex flex-col gap-y-3 p-6 border border-2 border-grey-900 rounded-xl">
          <p className="font-bold">{projects.length} projects enrolled</p>

          <div>
            <div
              className={`flex flex-wrap gap-1 max-h-[120px] rounded-lg overflow-hidden items-start`}
            >
              {projects.map((project: any, index: number) => {
                return (
                  <Image
                    src={project.icon}
                    width={44}
                    height={44}
                    alt="Project"
                    key={"projectsEnrolled-" + index}
                  />
                )
              })}
            </div>
            {projects.length > 10 ? (
              <div className="w-full bg-gray-300 h-[2px]" />
            ) : (
              <></>
            )}
          </div>

          {units && (
            <LittleSection
              title={`${formatNumber(units)} Units`}
              description="High quality onchain value"
            />
          )}
          {opRewarded && (
            <LittleSection
              title={`${formatNumber(opRewarded)} OP`}
              description="Rewarded across projects so far"
            />
          )}
          {avgOpRewardPerProject && (
            <LittleSection
              title={`${formatNumber(avgOpRewardPerProject)} OP`}
              description="Average rewards per project"
            />
          )}
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
