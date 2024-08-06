"use client"

import { Application } from "@prisma/client"
import { useState } from "react"

import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"

import { ApplicationSubmitted } from "./ApplicationSubmitted"
import { FundingApplication } from "./FundingApplication"

export const ApplicationFlow = ({
  className,
  projects,
  applications,
}: {
  className?: string
  projects: ProjectWithDetails[]
  applications: ApplicationWithDetails[]
}) => {
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null)

  return submittedApp ? (
    <ApplicationSubmitted className={className} application={submittedApp} />
  ) : (
    <FundingApplication
      className={className}
      projects={projects}
      applications={applications}
      onApplied={setSubmittedApp}
    />
  )
}
