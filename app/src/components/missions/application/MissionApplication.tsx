"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Application } from "@prisma/client"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { useUserProjects } from "@/hooks/db/useUserProjects"
import { useUserRoundApplications } from "@/hooks/db/useUserRoundApplications"
import { submitApplications } from "@/lib/actions/applications"
import { ProjectWithDetails } from "@/lib/types"

import { ApplicationSubmitted } from "./ApplicationSubmitted"
import EmailSignupDialog from "./dialogs/EmailSignupDialog"
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

export function MissionApplication() {
  const round = useMissionFromPath()
  const session = useSession()

  const form = useForm<z.infer<typeof ApplicationFormSchema>>({
    resolver: zodResolver(ApplicationFormSchema),
    shouldFocusError: true,
    mode: "onChange",
  })

  const { data: projects, isLoading } = useUserProjects(round?.number)
  const { data: applications } = useUserRoundApplications(round?.number)

  const [submittedApplications, setSubmittedApplications] = useState<
    Application[]
  >([])

  const submitApplication = async (
    email: string | null | undefined,
    selectedProjects: z.infer<typeof ApplicationFormSchema>["projects"],
  ) => {
    if (email === null || email === undefined) {
      setShowDialog(true)
      return
    }

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

  const [showDialog, setShowDialog] = useState(false)

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
      {showDialog && (
        <EmailSignupDialog
          open
          onOpenChange={setShowDialog}
          form={form}
          onSubmit={submitApplication}
        />
      )}{" "}
      <MissionApplicationBreadcrumbs />
      <div className="flex flex-col mt-10 gap-6">
        <h2 className="text-4xl mb-2">
          {"Apply for Retro Funding: " + round?.name}
        </h2>
        <div>
          {`Submit this application by ${format(
            round!.applyBy,
            "MMM d",
          )} to be evaluated for rewards starting 
                    ${format(round!.startsAt, "MMM d")}.`}
        </div>
        <div className="h-[2px] bg-secondary" />
      </div>
      <div className="mt-16 bg-background flex flex-col w-full max-w-5xl rounded-3xl z-10">
        <MissionApplicationTabs form={form} onSubmit={submitApplication} />
      </div>
    </div>
  )
}
