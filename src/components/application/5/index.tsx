"use client"

import { useState } from "react"

import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"

import { FundingApplication } from "../5/FundingApplication"
import { ApplicationSubmitted } from "../ApplicationSubmitted"

export const ApplicationFlow = ({
  className,
  projects,
  applications,
}: {
  className?: string
  projects: ProjectWithDetails[]
  applications: ApplicationWithDetails[]
}) => {
  const [submittedApp, setSubmittedApp] =
    useState<ApplicationWithDetails | null>(null)

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
