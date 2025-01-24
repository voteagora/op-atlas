"use client"
import { Application } from "@prisma/client"
import { format } from "date-fns"
import { usePathname } from "next/navigation"
import React, { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { useMissionFromPath } from "@/hooks/useMissionFromPath"
import { submitApplications } from "@/lib/actions/applications"
import {
  FundingRound,
  MODERN_FUNDING_ROUNDS,
  ModernFundingRound,
} from "@/lib/mocks"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"

import { ApplicationSubmitted } from "./ApplicationSubmitted"
import { MissionApplicationBreadcrumbs } from "./MissionApplicationBreadcrumbs"
import { MissionApplicationTabs } from "./MissionApplicationTabs"

export const ApplicationFormSchema = z.object({
  projects: z.array(
    z.object({
      projectId: z.string(),
      category: z.string(),
      selected: z.boolean(),
      projectDescriptionOptions: z.array(z.string()),
      impactStatement: z.record(z.string(), z.string()),
    }),
  ),
})

export function MissionApplication({
  projects,
  applications,
}: {
  projects: ProjectWithDetails[]
  applications: ApplicationWithDetails[]
}) {
  const round = useMissionFromPath()

  const [submittedApplications, setSubmittedApplications] = useState<
    Application[]
  >([])

  const submitApplication = async (selectedProjects: any) => {
    const promise: Promise<Application[]> = new Promise(
      async (resolve, reject) => {
        try {
          const result = await submitApplications(
            selectedProjects.map((project: any) => ({
              categoryId: project.category,
              projectId: project.projectId,
              projectDescriptionOptions: project.projectDescriptionOptions,
              impactStatement: project.impactStatement,
            })),
            round!.number,
          )

          if (result.error !== null || result.applications.length === 0) {
            throw new Error(result.error ?? "Error submitting application")
          }

          resolve(result.applications)
        } catch (error) {
          console.error("Error submitting application", error)
          reject(error)
        }
      },
    )

    toast.promise(promise, {
      loading: "Submitting application...",
      success: (applications) => {
        setSubmittedApplications(applications)
        return "Application submitted"
      },
      error: (error) => {
        return error.message
      },
    })
  }

  const submittedProjects: ProjectWithDetails[] = []

  submittedApplications?.map((application) => {
    const isProjectSubmitted = projects.find((project: ProjectWithDetails) => {
      return project.id === application.projectId
    })

    if (isProjectSubmitted) submittedProjects.push(isProjectSubmitted)
  })

  if (submittedProjects?.length > 0) {
    return (
      <ApplicationSubmitted
        className="mt-18 max-w-4xl"
        application={applications[0]}
        submittedProjects={submittedProjects}
      />
    )
  }
  return (
    <div className="mt-16 bg-background flex flex-col px-16 w-full max-w-5xl rounded-3xl z-10">
      {" "}
      <MissionApplicationBreadcrumbs />
      <div className="flex flex-col mt-10">
        <h2 className="text-4xl mb-2">
          {"Apply for Retro Funding: " + round?.name}
        </h2>
        {`Submit this application by ${format(
          round!.applyBy,
          "MMM d",
        )} to be evaluated for rewards starting 
                    ${format(round!.startsAt, "MMM d")}.`}
        <div className="h-[2px] bg-secondary" />
      </div>
      <div className="mt-16 bg-background flex flex-col w-full max-w-5xl rounded-3xl z-10">
        <MissionApplicationTabs
          applications={applications}
          projects={projects}
          onSubmit={submitApplication}
        />
      </div>
    </div>
  )
}
