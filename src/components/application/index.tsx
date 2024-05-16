"use client"

import { Application } from "@prisma/client"
import { useCallback, useState } from "react"
import { toast } from "sonner"

import { submitApplications } from "@/lib/actions/applications"
import { ProjectWithDetails } from "@/lib/types"

import { ApplicationSubmitted } from "./ApplicationSubmitted"
import { FundingApplication } from "./FundingApplication"

export const ApplicationFlow = ({
  className,
  projects,
  applications,
}: {
  className?: string
  projects: ProjectWithDetails[]
  applications: Application[]
}) => {
  const [submittedApplication, setSubmittedApplication] =
    useState<Application | null>(null)

  const onApply = useCallback(async (projectIds: string[]) => {
    const result = await submitApplications(projectIds)
    if (result.error !== null || result.applications.length === 0) {
      toast.error("There was an error submitting your application")
      return
    }

    setSubmittedApplication(result.applications[0])
  }, [])

  return submittedApplication ? (
    <ApplicationSubmitted
      className={className}
      application={submittedApplication}
    />
  ) : (
    <FundingApplication
      className={className}
      projects={projects}
      applications={applications}
      onApply={onApply}
    />
  )
}
