import Image from "next/image"
import { memo, useMemo } from "react"

import { ProjectWithDetails } from "@/lib/types"
import { cn, getProjectStatus } from "@/lib/utils"

import { Badge } from "../common/Badge"
import { Checkbox } from "../ui/checkbox"

export const ProjectCard = memo(function ProjectCard({
  className,
  project,
  disabled,
  isSelected,
  onSelect,
}: {
  className?: string
  project: ProjectWithDetails
  disabled?: boolean
  isSelected: boolean
  onSelect: (projectId: string) => void
}) {
  const isEligible = useMemo(() => {
    return getProjectStatus(project).progressPercent === 100
  }, [project])

  return (
    <div
      className={cn(
        "flex items-center gap-4 border rounded-2xl p-6",
        className,
      )}
    >
      <Checkbox
        disabled={!isEligible || disabled}
        checked={isSelected}
        onCheckedChange={() => onSelect(project.id)}
        className="mt-1 border-2 rounded-[2px]"
      />
      {project.thumbnailUrl ? (
        <Image
          alt={project.name}
          src={project.thumbnailUrl ?? undefined}
          height={64}
          width={64}
          className={cn(
            "h-16 w-16 rounded-lg bg-secondary",
            !isEligible && "opacity-50",
          )}
        />
      ) : (
        <div className="h-16 w-16 rounded-lg bg-secondary" />
      )}
      <p
        className={cn(
          "text-lg font-semibold truncate",
          !isEligible && "opacity-50",
        )}
      >
        {project.name}
      </p>

      {!isEligible && (
        <Badge size="lg" text="Not eligible" className="ml-auto" />
      )}
    </div>
  )
})
