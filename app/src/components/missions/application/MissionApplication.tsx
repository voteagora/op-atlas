"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Application } from "@prisma/client"
import { format } from "date-fns"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { useSessionAdminProjects } from "@/hooks/db/useAdminProjects"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { useSessionRoundApplications } from "@/hooks/db/useUserRoundApplications"
import { submitApplications } from "@/lib/actions/applications"
import { ProjectWithDetails } from "@/lib/types"

import { ApplicationSubmitted } from "./ApplicationSubmitted"
import { MissionApplicationBreadcrumbs } from "./MissionApplicationBreadcrumbs"
import { MissionApplicationTabs } from "./MissionApplicationTabs"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import { useSession } from "next-auth/react"

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

export function MissionApplication({ userId }: { userId: string }) {
  const mission = useMissionFromPath()
  const isOpenForEnrollment = mission && mission?.startsAt < new Date()

  const form = useForm<z.infer<typeof ApplicationFormSchema>>({
    resolver: zodResolver(ApplicationFormSchema),
    shouldFocusError: true,
    mode: "onChange",
  })

  const { data: projects, isLoading } = useSessionAdminProjects()
  const { data: applications } = useSessionRoundApplications(mission?.number)
  const { linkEmail } = usePrivyEmail(userId)
  const { data: session } = useSession()

  const [submittedApplications, setSubmittedApplications] = useState<
    Application[]
  >([])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitApplication = async () => {
    if (!session?.user.email) {
      linkEmail()
      return
    }

    const promise: Promise<Application[]> = new Promise(
      async (resolve, reject) => {
        setIsSubmitting(true)
        try {
          const result = await submitApplications(
            form
              .getValues()
              .projects.filter((project) => project.selected)
              .map((project) => ({
                categoryId: project.category,
                projectId: project.projectId,
                projectDescriptionOptions: project.projectDescriptionOptions,
                impactStatement: project.impactStatement,
              })),
            mission!.startsAt,
            mission!.roundName,
            mission!.number,
            undefined,
          )

          if (result.error !== null || result.applications.length === 0) {
            throw new Error(result.error ?? "Error submitting application")
          }

          resolve(result.applications)
        } catch (error) {
          console.error("Error submitting application", error)
          reject(error)
        } finally {
          setIsSubmitting(false)
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
        application={submittedApplications[0]}
        submittedProjects={submittedProjects}
      />
    )
  }
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
      <div className="mt-6 bg-background flex flex-col w-full max-w-5xl rounded-3xl z-10">
        <MissionApplicationTabs
          form={form}
          onSubmit={submitApplication}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
