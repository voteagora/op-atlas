import { Role, User } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/common/Button"
import { Close } from "@/components/icons/remix"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { UserProjectsWithDetails } from "@/lib/types"

import { ProjectSelectionModal } from "./ProjectSelectionModal"

const TERMS = [
  "Please verify that you understand you may be removed from this role via the Representative Removal proposal type in the Operating Manual.",
  "Please verify that you understand KYC will be required to receive rewards for this role.",
  "Please verify that you understand you may need to sign an agreement with the Foundation prior to onboarding.",
  "Please verify that you are able to commit the necessary time to this role.",
] as const

interface Project {
  project: {
    id: string
    name: string
    thumbnailUrl?: string | null
  }
}

interface StandardRoleFormProps {
  role: Role
  user: User
  userProjects?: UserProjectsWithDetails
  onSubmit: (data: {
    conflictsOfInterest: string
    projects: Array<{projectId: string, projectName: string, description: string}>
  }) => void
  isLoading: boolean
  requirementsSatisfied: boolean
}

export const StandardRoleForm = ({
  role,
  user,
  userProjects,
  onSubmit,
  isLoading,
  requirementsSatisfied: externalRequirementsSatisfied,
}: StandardRoleFormProps) => {
  const [checkedRules, setCheckedRules] = useState<Record<number, boolean>>({})
  const [conflictsOfInterest, setConflictsOfInterest] = useState("")
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([])
  const [projectRelevanceText, setProjectRelevanceText] = useState<Record<string, string>>({})
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  const allTermsChecked = TERMS.every((_, index) => checkedRules[index])
  const requirementsSatisfied = allTermsChecked && externalRequirementsSatisfied

  const handleCheckboxChange = (index: number) => {
    setCheckedRules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const handleProjectSelection = (project: Project) => {
    setSelectedProjects((prev) => {
      const isSelected = prev.some((p) => p.project.id === project.project.id)
      if (isSelected) {
        // Remove project relevance text when project is deselected
        setProjectRelevanceText((prevText) => {
          const newText = { ...prevText }
          delete newText[project.project.id]
          return newText
        })
        return prev.filter((p) => p.project.id !== project.project.id)
      } else {
        return [...prev, project]
      }
    })
  }

  const removeProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.filter((p) => p.project.id !== projectId),
    )
    // Remove project relevance text when project is removed
    setProjectRelevanceText((prevText) => {
      const newText = { ...prevText }
      delete newText[projectId]
      return newText
    })
  }

  const handleProjectRelevanceChange = (projectId: string, value: string) => {
    setProjectRelevanceText((prev) => ({
      ...prev,
      [projectId]: value,
    }))
  }

  const handleSubmit = () => {
    const projectsData = selectedProjects.map((project) => ({
      projectId: project.project.id,
      projectName: project.project.name,
      description: projectRelevanceText[project.project.id] || "",
    }))

    onSubmit({
      conflictsOfInterest,
      projects: projectsData,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-xl font-semibold">
        Confirm the following and link to any relevant projects
      </div>
      <div className="text-foreground">
        If you have any conflicts of interest, please explain them here.
      </div>
      <div className="relative">
        <Textarea
          className="w-full h-[120px] p-3 pb-8 border border-border rounded-md bg-background text-foreground text-sm resize-none focus:outline-none "
          placeholder="Explain your conflicts of interest (optional)"
          maxLength={280}
          value={conflictsOfInterest}
          onChange={(e) => setConflictsOfInterest(e.target.value)}
        />
        <div className="absolute top-[90px] left-[12px] text-xs text-muted-foreground">
          <span
            className={
              conflictsOfInterest.length >= 280 ? "text-red-500" : ""
            }
          >
            {conflictsOfInterest.length}/280
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {TERMS.map((term, index) => (
          <div key={index} className="flex flex-col gap-6">
            <div className="text-foreground">{term}</div>
            <div className="flex flex-row gap-2">
              <Checkbox
                className="self-start mt-0.5"
                id={`rule-${index}`}
                checked={checkedRules[index] || false}
                onCheckedChange={() => handleCheckboxChange(index)}
              />
              <label
                htmlFor={`rule-${index}`}
                className="text-base text-foreground"
              >
                I understand
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="text-foreground">
        Which projects demonstrate your expertise in this area?
        <div className="text-muted-foreground">
          Choose from your projects in Atlas. If your project isn&apos;t in
          Atlas, then{" "}
          <Link href="/projects/new" className="underline">
            add your project
          </Link>{" "}
          before continuing here. To join a project or organization that
          already exists in Atlas, please have their admin add you.{" "}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between text-foreground">
          <div className="flex flex-col">
            Projects that demonstrate your expertise (optional){" "}
            <p className="text-muted-foreground text-xs">
              Create new projects by visiting your profile&apos;s dashboard
            </p>
          </div>
          <ProjectSelectionModal
            userProjects={userProjects}
            selectedProjects={selectedProjects}
            isOpen={isProjectModalOpen}
            onOpenChange={setIsProjectModalOpen}
            onProjectSelect={handleProjectSelection}
          />
        </div>

        {/* NO PROJECTS SELECTED */}
        {selectedProjects.length === 0 ? (
          <button
            type="button"
            className="text-muted-foreground border border-border rounded-md px-3 py-2 cursor-pointer text-left w-full"
            onClick={() => setIsProjectModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setIsProjectModalOpen(true)
              }
            }}
            aria-label="Open project selection modal"
          >
            None
          </button>
        ) : null}
      </div>

      {/* PROJECTS SELECTED */}
      {selectedProjects.map((project) => (
        <div
          key={project.project.id}
          className="text-muted-foreground border border-border rounded-md p-5 flex flex-col gap-4"
        >
          <div className="flex flex-row gap-2 justify-between items-center">
            <div className="flex flex-row gap-2 items-center">
              {project.project.thumbnailUrl && (
                <Image
                  src={project.project.thumbnailUrl}
                  alt={project.project.name}
                  width={24}
                  height={24}
                  className="rounded-md"
                />
              )}
              <div className="text-foreground">{project.project.name}</div>
            </div>
            <button
              type="button"
              onClick={() => removeProject(project.project.id)}
              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded"
              aria-label={`Remove ${project.project.name} from selection`}
            >
              <Close className="w-4 h-4" fill="#000" />
            </button>
          </div>

          <div className="relative">
            <Textarea
              className="w-full h-[120px] p-3 pb-8 border border-border rounded-md bg-background text-foreground text-sm resize-none focus:outline-none "
              placeholder="How is this project relevant to your application? (optional)"
              maxLength={280}
              value={projectRelevanceText[project.project.id] || ""}
              onChange={(e) =>
                handleProjectRelevanceChange(project.project.id, e.target.value)
              }
            />
            <div className="absolute top-[90px] left-[12px] text-xs text-muted-foreground">
              <span
                className={
                  (projectRelevanceText[project.project.id] || "").length >=
                  280
                    ? "text-red-500"
                    : ""
                }
              >
                {(projectRelevanceText[project.project.id] || "").length}/280
              </span>
            </div>
          </div>
        </div>
      ))}

      <Button
        onClick={handleSubmit}
        className="button-primary mt-10"
        disabled={!requirementsSatisfied || isLoading}
      >
        {isLoading ? "Submitting..." : "Submit"}
      </Button>
    </div>
  )
}
