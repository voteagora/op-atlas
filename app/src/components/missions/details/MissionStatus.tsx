
import React from "react"
import { useGitHubMissions } from "@/hooks/api/useGithubMissions"
import { cn } from "@/lib/utils"

interface StatusRowProps {
  type: "open" | "inProgress" | "done"
  count: number
  isLoading?: boolean
}

const statusDescription = {
  open: {
    description: "Accepting proposals from individuals and teams.",
    color: "text-info",
    label: "Open",
    backgroundColor: "bg-callout",
  },
  inProgress: {
    description: "An individual or team is working on these missions.",
    color: "text-[#006117]",
    label: "In Progress",
    backgroundColor: "bg-success",
  },
  done: {
    description: "Missions are live and deployed.",
    color: "text-[#B80018]",
    label: "Done",
    backgroundColor: "bg-red-200",
  },
}

const StatusRow: React.FC<StatusRowProps> = ({ type, count, isLoading }) => (
  <div className="flex flex-row w-full justify-start items-center gap-4 overflow-hidden">
    <div
      className={cn(
        "py-4 rounded-full w-14 h-14 inline-flex flex-col justify-center items-center gap-2.5",
        statusDescription[type].backgroundColor,
      )}
    >
      <div
        className={cn(
          "self-stretch text-center justify-start text-base font-semibold",
          statusDescription[type].color,
        )}
      >
        {isLoading ? "" : count}
      </div>
    </div>
    <div className="flex-1 inline-flex flex-col justify-start items-start">
      <div className="self-stretch justify-start text-foreground text-base font-medium">
        {statusDescription[type].label}
      </div>
      <div className="self-stretch justify-start text-secondary-foreground text-base font-normal">
        {statusDescription[type].description}
      </div>
    </div>
  </div>
)

export function MissionStatus() {
  const { data, isLoading, error } = useGitHubMissions()

  if (error) {
    console.error("Error loading mission status:", error)
    return null
  }

  const statusCounts = data?.statusCounts || {
    open: 0,
    inProgress: 0,
    done: 0,
    total: 0,
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-foreground">
          Status of missions
        </h3>
      </div>

      <StatusRow type="open" count={statusCounts.open} isLoading={isLoading} />
      <StatusRow
        type="inProgress"
        count={statusCounts.inProgress}
        isLoading={isLoading}
      />
      <StatusRow type="done" count={statusCounts.done} isLoading={isLoading} />
    </div>
  )
}
