"use client"
import { Application } from "@prisma/client"
import { format } from "date-fns"
import React, { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { submitApplications } from "@/lib/actions/applications"
import { ProjectWithDetails } from "@/lib/types"

import { ApplicationSubmitted } from "./ApplicationSubmitted"
import { MissionApplicationBreadcrumbs } from "./MissionApplicationBreadcrumbs"
import {
  ApplicationFormSchema,
  MissionApplicationTabs,
} from "./MissionApplicationTabs"
import { useUserProjects } from "@/hooks/db/useUserProjects"
import { useUserRoundApplications } from "@/hooks/db/useUserRoundApplications"

export function MissionApplication() {
  const round = useMissionFromPath()

  const { data: projects, isLoading } = useUserProjects(round?.number)
  const { data: applications } = useUserRoundApplications(round?.number)

  const [submittedApplications, setSubmittedApplications] = useState<
    Application[]
  >([])

  const submitApplication = async (
    selectedProjects: z.infer<typeof ApplicationFormSchema>["projects"],
  ) => {
    const promise: Promise<Application[]> = new Promise(
      async (resolve, reject) => {
        try {
          const result = await submitApplications(
            selectedProjects.map((project) => ({
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
    const isProjectSubmitted = projects?.find((project: ProjectWithDetails) => {
      return project.id === application.projectId
    })

    if (isProjectSubmitted) submittedProjects.push(isProjectSubmitted)
  })

  if (submittedProjects?.length > 0 && applications) {
    return (
      <ApplicationSubmitted
        className="mt-18 max-w-4xl"
        application={submittedApplications[0]}
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
        <MissionApplicationTabs onSubmit={submitApplication} />
      </div>
    </div>
  )
}
