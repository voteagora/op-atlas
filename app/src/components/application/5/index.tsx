"use client"

import { useState } from "react"

import type { ProjectActionDTO } from "@/lib/dto"
import {
  ApplicationWithDetails,
  CategoryWithImpact,
} from "@/lib/types"

import { ApplicationSubmitted } from "../ApplicationSubmitted"
import { FundingApplication } from "./FundingApplication"

export const ApplicationFlow = ({
  className,
  projects,
  applications,
  categories,
}: {
  className?: string
  projects?: ProjectActionDTO[]
  applications: ApplicationWithDetails[]
  categories: CategoryWithImpact[]
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
      categories={categories}
      onApplied={setSubmittedApp}
    />
  )
}
