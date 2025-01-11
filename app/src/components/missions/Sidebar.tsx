"use client"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { useSession } from "next-auth/react"

export const Sidebar = ({
  className,
  applyByDate,
  startDate,
  projectsEnrolled,
  units,
  opRewarded,
  avgOpRewardPerProject,
  userProjectCount,
}: {
  className?: string
  applyByDate: string
  startDate: string
  projectsEnrolled: number
  units: string
  opRewarded: string
  avgOpRewardPerProject: string
  userProjectCount: number
}) => {
  const router = useRouter()

  const { data } = useSession()

  return (
    <div className={cn("flex flex-col gap-y-6", className)}>
      <div className="flex flex-col items-center justify-center gap-y-3 p-6 border border-2 border-grey-900 rounded-xl">
        <p className="font-bold">
          {!data || userProjectCount > 0 ? "Apply" : "Add project to apply"}{" "}
        </p>

        <p className="text-sm text-secondary-foreground text-center">
          {!data || userProjectCount > 0 ? (
            <p>
              {`Apply by ${applyByDate} to be evaluated for rewards starting 
              ${startDate}`}
              .
            </p>
          ) : (
            <p>
              {
                "You can’t apply for this Retro Funding Mission until you’ve added your project to OP Atlas."
              }
            </p>
          )}
        </p>
        {!data ? (
          <Button className="bg-optimismRed text-white" variant={"outline"}>
            Sign up or sign in
          </Button>
        ) : userProjectCount > 0 ? (
          <Button className="bg-optimismRed text-white" variant={"outline"}>
            Apply
          </Button>
        ) : (
          <div className="flex flex-col w-full gap-2">
            <Button className="bg-optimismRed text-white" variant={"outline"}>
              Add Project
            </Button>
            <Button
              variant={"ghost"}
              onClick={() => {
                router.push("/dashboard")
              }}
            >
              View Dashboard
            </Button>
          </div>
        )}
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
