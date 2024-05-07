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
  const [hasApplied, setHasApplied] = useState(false)

  const onApply = useCallback(async (projectId: string) => {
    const { error } = await submitApplication(projectId)
    if (!error) {
      setHasApplied(true)
    }
  }, [])

  return hasApplied ? (
    <ApplicationSubmitted className={className} />
  ) : (
    <FundingApplication
      className={className}
      projects={projects}
      onApply={onApply}
    />
  )
}
