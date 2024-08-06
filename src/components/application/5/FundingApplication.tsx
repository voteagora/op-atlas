import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"
import { cn } from "@/lib/utils"

import ApplicationFormTabs from "./ApplicationFormTabs"
import ApplicationHeader from "./ApplicationHeader"

export const FundingApplication = ({
  className,
  projects,
  applications,
  onApplied,
}: {
  className?: string
  projects: ProjectWithDetails[]
  applications: ApplicationWithDetails[]
  onApplied: (application: ApplicationWithDetails) => void
}) => {
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
      <ApplicationFormTabs
        onApplied={onApplied}
        applications={applications}
        projects={projects}
      />
    </div>
  )
}
