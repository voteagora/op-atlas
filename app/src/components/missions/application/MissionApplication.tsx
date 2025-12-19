"use client"
import { format } from "date-fns"

import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"

import { MissionApplicationBreadcrumbs } from "./MissionApplicationBreadcrumbs"

export function MissionApplication({ userId }: { userId: string }) {
  const mission = useMissionFromPath()
  const isOpenForEnrollment = mission && mission?.startsAt < new Date()

  return (
    <div className="mt-16 bg-background flex flex-col px-16 w-full max-w-5xl rounded-3xl z-10">
      <MissionApplicationBreadcrumbs />
      <div className="flex flex-col mt-10 gap-2">
        <h2 className="text-4xl">
          {"Apply for Retro Funding: " + mission?.name}
        </h2>

        <p className="text-secondary-foreground">
          {isOpenForEnrollment &&
            mission!.applyBy &&
            `Apply by ${format(
              mission!.applyBy,
              "MMM d",
            )} to be evaluated for rewards starting ${format(
              new Date(new Date().getFullYear(), mission!.evaluationMonth, 1),
              "MMM d",
            )}.`}

          {!isOpenForEnrollment && "Not open for enrollment--coming soon"}
        </p>

        <div className="h-[2px] bg-secondary mt-6" />
      </div>
    </div>
  )
}
