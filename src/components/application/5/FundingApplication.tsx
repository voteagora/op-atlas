import { useSession } from "next-auth/react"

import {
  ApplicationWithDetails,
  CategoryWithImpact,
  ProjectWithDetails,
} from "@/lib/types"
import { cn } from "@/lib/utils"

import ApplicationDetails from "./ApplicationDetails"
import ApplicationFormTabs from "./ApplicationFormTabs"
import ApplicationHeader from "./ApplicationHeader"

export const FundingApplication = ({
  className,
  projects,
  applications,
  onApplied,
  categories,
}: {
  className?: string
  projects?: ProjectWithDetails[]
  applications: ApplicationWithDetails[]
  categories: CategoryWithImpact[]
  onApplied: (application: ApplicationWithDetails) => void
}) => {
  const { data } = useSession()
  const hasApplied = applications.length > 0

  return (
    <div
      className={cn(
        "flex flex-col gap-y-12 w-full bg-background border rounded-3xl p-16",
        className,
      )}
    >
      {/* Header */}
      <ApplicationHeader hasApplied={hasApplied} applications={applications} />

      {/* Tabs */}

      {data?.user ? (
        <ApplicationFormTabs
          onApplied={onApplied}
          applications={applications}
          projects={projects}
          categories={categories}
        />
      ) : (
        <ApplicationDetails />
      )}
    </div>
  )
}
