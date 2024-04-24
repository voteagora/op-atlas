"use client"

import { useState } from "react"
import { Project } from "@/lib/mocks"
import { FundingApplication } from "./FundingApplication"
import { ApplicationSubmitted } from "./ApplicationSubmitted"

export const Application = ({
  className,
  projects,
}: {
  className?: string
  projects: Project[]
}) => {
  const [hasApplied, setHasApplied] = useState(false)

  return hasApplied ? (
    <ApplicationSubmitted className={className} />
  ) : (
    <FundingApplication
      className={className}
      projects={projects}
      onApply={() => setHasApplied(true)}
    />
  )
}
