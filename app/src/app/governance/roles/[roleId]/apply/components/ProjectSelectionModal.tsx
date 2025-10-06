import Image from "next/image"

import { Button } from "@/components/common/Button"
import { ArrowRightS, CheckboxLine, Close } from "@/components/icons/remix"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserProjectsWithDetails } from "@/lib/types"
import { useMemo } from "react"

interface Project {
  project: {
    id: string
    name: string
    thumbnailUrl?: string | null
  }
}

interface ProjectSelectionModalProps {
  userProjects?: UserProjectsWithDetails
  selectedProjects: Project[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onProjectSelect: (project: Project) => void
  onAddProject?: () => void
  triggerText?: string
  showTrigger?: boolean
}

export const ProjectSelectionModal = ({
  userProjects,
  selectedProjects,
  isOpen,
  onOpenChange,
  onProjectSelect,
  onAddProject,
  triggerText = "Choose",
  showTrigger = true,
}: ProjectSelectionModalProps) => {
  const handleAddProject = () => {
    onOpenChange(false)
    if (onAddProject) {
      onAddProject()
    } else {
      window.open("/projects/new", "_blank")
    }
  }

  const allProjects = useMemo(() => {
    const direct = userProjects?.projects ?? []
    const orgProjects =
      userProjects?.organizations?.flatMap(
        (org) => org.organization?.projects ?? [],
      ) ?? []

    // Dedupe by project.project.id
    const byId = new Map<string, Project>()
    ;[...direct, ...orgProjects].forEach((p: any) => {
      const id = p?.project?.id
      if (id && !byId.has(id)) {
        byId.set(id, p as Project)
      }
    })

    return Array.from(byId.values())
  }, [userProjects])

  const triggerButton = (
    <button className="flex items-center gap-1 font-medium text-sm text-foreground focus:outline-none">
      <CheckboxLine className="w-4 h-4" />
      <span>{triggerText}</span>
      <ArrowRightS className="w-4 h-4" />
    </button>
  )

  const dialogContent = (
    <DialogContent className="border-tertiary rounded-xl p-0 max-w-[458px]">
      {allProjects.length > 0 ? (
        // Modal with projects
        <>
          <DialogHeader className="p-6 pb-4 text-center">
            <DialogTitle className="text-xl font-semibold text-foreground leading-[28px]">
              Choose the projects that demonstrate your expertise
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-2 flex flex-col gap-2">
            {allProjects.map((project) => {
              const isSelected = selectedProjects.some(
                (p) => p.project.id === project.project.id,
              )
              return (
                <div
                  key={project.project.id}
                  className="border border-tertiary rounded-md px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => onProjectSelect(project)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onProjectSelect(project)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onProjectSelect(project)}
                    className="w-5 h-5"
                  />
                  {project.project.thumbnailUrl && (
                    <Image
                      src={project.project.thumbnailUrl}
                      alt={project.project.name}
                      width={24}
                      height={24}
                      className="rounded-sm"
                    />
                  )}
                  <div className="text-sm font-normal text-foreground">
                    {project.project.name}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="p-6 pt-0 flex flex-col gap-2">
            <Button
              className="bg-brand-primary text-foreground w-full py-2.5 px-6 rounded-md font-medium text-base"
              onClick={() => onOpenChange(false)}
            >
              Choose
            </Button>
            <Button
              variant="outline"
              className="border-tertiary text-foreground w-full py-2.5 px-6 rounded-md font-medium text-base"
              onClick={handleAddProject}
            >
              Add project
            </Button>
          </div>
        </>
      ) : (
        // Modal with no projects
        <>
          <DialogHeader className="p-6 pb-4 text-center">
            <DialogTitle className="text-xl font-semibold text-foreground leading-[28px] mb-2">
              You haven&apos;t added or joined any projects in Atlas
            </DialogTitle>
            <div className="text-base font-normal text-secondary-foreground leading-[24px]">
              Click below to add your project to Atlas. To join a project or
              organization that already exists in Atlas, please have their admin
              add you.
            </div>
          </DialogHeader>
          <div className="px-6 pb-6">
            <Button
              className="bg-brand-primary text-foreground w-full py-2.5 px-6 rounded-md font-medium text-base"
              onClick={handleAddProject}
            >
              Add project
            </Button>
          </div>
        </>
      )}
    </DialogContent>
  )

  if (!showTrigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {dialogContent}
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  )
}
