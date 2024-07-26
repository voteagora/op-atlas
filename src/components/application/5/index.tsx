"use client"

import { Application } from "@prisma/client"
import { useState } from "react"

import { ProjectWithDetails } from "@/lib/types"

import { FundingApplication } from "../5/FundingApplication"

export const ApplicationFlow = ({
  className,
  projects,
  applications,
}: {
  className?: string
  projects: ProjectWithDetails[]
  applications: Application[]
}) => {
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null)

  return (
    <FundingApplication
      className={className}
      projects={projects}
      applications={applications}
      onApplied={setSubmittedApp}
    />
  )
}
