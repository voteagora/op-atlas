import Image from "next/image"
import { memo, useMemo, useState } from "react"

import { useProjectContracts } from "@/hooks/db/useProjectContracts"
import { useProjectDetails } from "@/hooks/db/useProjectDetails"
import { ProjectWithDetails } from "@/lib/types"
import { cn, getProjectStatus } from "@/lib/utils"

import { Badge } from "../common/Badge"
import { Checkbox } from "../ui/checkbox"
import IneligibleDialog from "./IneligibleDialog"

export const ProjectCard = memo(function ProjectCard({
  className,
  project,
  hasApplied,
  isSelected,
  onSelect,
}: {
  className?: string
  project: ProjectWithDetails
  hasApplied?: boolean
  isSelected: boolean
  onSelect: (projectId: string) => void
}) {
  const { data: contracts } = useProjectContracts(project.id)
  const { data: projectDetails } = useProjectDetails(project.id)

  const isEligible = useMemo(() => {
    return (
      getProjectStatus(projectDetails ?? null, contracts ?? null)
        .progressPercent === 100
    )
  }, [projectDetails, contracts])

  const [ineligibleDialogOpen, setIneligibleDialogOpen] = useState(false)

  const isIneligible = !isEligible && !hasApplied

  return (
    <>
      {ineligibleDialogOpen && (
        <IneligibleDialog open onOpenChange={setIneligibleDialogOpen} />
      )}
      <button
        onClick={() => isIneligible && setIneligibleDialogOpen(true)}
        className={cn(
          "flex items-center gap-4 border rounded-2xl p-6",
          isIneligible ? "cursor-pointer" : "cursor-default",
          className,
        )}
      >
        <Checkbox
          disabled={!isEligible || hasApplied}
          checked={isSelected}
          onCheckedChange={() => onSelect(project.id)}
          className="mt-1"
        />
        {project.thumbnailUrl ? (
          <Image
            alt={project.name}
            src={project.thumbnailUrl ?? undefined}
            height={64}
            width={64}
            className={cn(
              "h-16 w-16 rounded-lg bg-secondary",
              isIneligible && "opacity-50",
            )}
          />
        ) : (
          <div className="h-16 w-16 rounded-lg bg-secondary" />
        )}
        <p
          className={cn(
            "text-lg font-normal truncate",
            isIneligible && "opacity-50",
          )}
        >
          {project.name}
        </p>

        {hasApplied && (
          <div className="ml-auto flex items-center gap-1 py-1 px-3 rounded-full bg-success">
            <Image
              alt="Checkmark"
              src="/assets/icons/circle-check-green.svg"
              height={14}
              width={14}
            />
            <p className="font-normal text-sm text-success-foreground">
              Submitted
            </p>
          </div>
        )}

        {isIneligible && (
          <Badge size="lg" text="Not eligible" className="ml-auto" />
        )}
      </button>
    </>
  )
})
