"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import {
  ApplicationWithDetails,
  CategoryWithImpact,
  ProjectWithDetails,
} from "@/lib/types"

import { FundingApplication } from "../6/FundingApplication"
import { ApplicationSubmitted } from "../ApplicationSubmitted"

export const ApplicationFlow = ({
  className,
  projects,
  applications,
  categories,
}: {
  className?: string
  projects?: ProjectWithDetails[]
  applications: ApplicationWithDetails[]
  categories: CategoryWithImpact[]
}) => {
  const [submittedApp, setSubmittedApp] =
    useState<ApplicationWithDetails | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const successParam = searchParams?.get("success") || "false"
  const isSuccess = successParam === "true"

  const addSuccessParam = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("success", "true")
    router.push(`?${params.toString()}`)
  }

  const removeSuccessParam = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("success")
    router.push(`?${params.toString()}`)
  }

  const onApplied = () => {
    setSubmittedApp(applications[0])
    addSuccessParam()
  }

  // a bit worried that changes here will affect other cycles
  // if this is the case, we can make a new component for the success page
  if (isSuccess) {
    return (
      <ApplicationSubmitted
        className={className}
        application={applications[0]}
        onClose={removeSuccessParam}
      />
    )
  }

  return submittedApp ? (
    <ApplicationSubmitted className={className} application={submittedApp} />
  ) : (
    <FundingApplication
      className={className}
      projects={projects}
      applications={applications}
      categories={categories}
      onApplied={onApplied}
    />
  )
}
