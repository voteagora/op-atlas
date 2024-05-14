"use client"

import { Application } from "@prisma/client"
import { useCallback, useState } from "react"

import { submitApplication } from "@/lib/actions/applications"
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

  const onApply = useCallback(async (projectId: string) => {
    const result = await submitApplication(projectId)
    if (result.error !== null || !result.application) return

    setSubmittedApplication(result.application)
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
