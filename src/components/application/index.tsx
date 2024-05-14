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

  return applications.length > 0 ? (
    <ApplicationSubmitted className={className} application={applications[0]} />
  ) : (
    <FundingApplication
      className={className}
      projects={projects}
      applications={applications}
      onApply={onApply}
    />
  )
}
