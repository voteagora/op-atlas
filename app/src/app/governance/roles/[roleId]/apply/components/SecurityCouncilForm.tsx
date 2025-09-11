import { Role, User } from "@prisma/client"
import Image from "next/image"
import { useState } from "react"

import { Button } from "@/components/common/Button"
import ExternalLink from "@/components/ExternalLink"
import { AddFill, Close } from "@/components/icons/remix"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { UserProjectsWithDetails } from "@/lib/types"

import { ProjectSelectionModal } from "./ProjectSelectionModal"

const firstSecurityRoleTerm = (
  <div>
    <p className="font-medium text-base text-foreground">
      Please verify that you understand you may be removed from this role via
      the Representative Removal proposal type in the{" "}
      <ExternalLink
        className="underline"
        href="https://github.com/optimismfoundation/operating-manual/blob/main/governance/representative-removal.md"
      >
        Operating Manual
      </ExternalLink>
      .
    </p>
  </div>
)
const SECURITY_ROLE_TERMS = [
  firstSecurityRoleTerm,
  "Please verify that you understand that election is subject to successful completion of a Foundation screen which may include KYC/AML, sanctions screening, and a requirement to sign a standard contract",
  "Please verify that you are able to commit ~5 active hours / month to fulfill the Member Responsibilities",
] as const

interface Project {
  project: {
    id: string
    name: string
    thumbnailUrl?: string | null
  }
}

interface SecurityCouncilFormProps {
  role: Role
  user: User
  userProjects?: UserProjectsWithDetails
  onSubmit: (data: {
    personalStatement: string
    conflictsOfInterest: string
    externalLinks: Array<{ url: string; description: string }>
    projects: Array<{
      projectId: string
      projectName: string
      description: string
    }>
    noConflictsChecked: boolean
  }) => void
  isLoading: boolean
  requirementsSatisfied: boolean
}

export const SecurityCouncilForm = ({
  role,
  user,
  userProjects,
  onSubmit,
  isLoading,
  requirementsSatisfied: externalRequirementsSatisfied,
}: SecurityCouncilFormProps) => {
  const [personalStatement, setPersonalStatement] = useState("")
  const [conflictsOfInterest, setConflictsOfInterest] = useState("")
  const [externalLinks, setExternalLinks] = useState<
    Array<{ url: string; description: string }>
  >([])
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([])
  const [projectRelevanceText, setProjectRelevanceText] = useState<
    Record<string, string>
  >({})
  const [securityCouncilTermsChecked, setSecurityCouncilTermsChecked] =
    useState<Record<number, boolean>>({})
  const [noConflictsChecked, setNoConflictsChecked] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  const requirementsSatisfied =
    SECURITY_ROLE_TERMS.every(
      (_, index) => securityCouncilTermsChecked[index],
    ) &&
    externalRequirementsSatisfied &&
    (noConflictsChecked || conflictsOfInterest.trim().length > 0)

  const handleSecurityCouncilTermsChange = (index: number) => {
    setSecurityCouncilTermsChecked((prev) => ({
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

  const addExternalLink = () => {
    setExternalLinks((prev) => [...prev, { url: "", description: "" }])
  }

  const removeExternalLink = (index: number) => {
    setExternalLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const updateExternalLink = (
    index: number,
    field: "url" | "description",
    value: string,
  ) => {
    setExternalLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    )
  }

  const handleSubmit = () => {
    const projectsData = selectedProjects.map((project) => ({
      projectId: project.project.id,
      projectName: project.project.name,
      description: projectRelevanceText[project.project.id] || "",
    }))

    onSubmit({
      personalStatement,
      conflictsOfInterest,
      externalLinks,
      projects: projectsData,
      noConflictsChecked,
    })
  }

  return (
    <div className="flex flex-col gap-20 w-full">
      {/* Personal Statement Section */}
      <div className="flex flex-col gap-6">
        <div className="text-xl font-semibold text-foreground">
          Personal statement
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col leading-6">
            <div className="font-medium text-base text-foreground">
              Why are you interested in being a {role.title}?
            </div>
            <div className="text-secondary-foreground text-base">
              A personal statement will help the community understand your
              motivations, and ultimately why you&apos;d be great for the role.
            </div>
          </div>
          <div className="relative">
            <Textarea
              className="w-full min-h-[120px] pb-8 border-tertiary text-foreground text-sm resize-none focus-visible:ring-0"
              placeholder="Add a personal statement (optional)"
              maxLength={280}
              value={personalStatement}
              onChange={(e) => setPersonalStatement(e.target.value)}
            />
            <div className="absolute bottom-3 left-3 text-xs text-muted-foreground">
              <span
                className={
                  personalStatement.length >= 280 ? "text-red-500" : ""
                }
              >
                {personalStatement.length}/280
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Relevant Projects Section */}
      <div className="flex flex-col gap-6">
        <div className="text-xl font-semibold text-foreground">
          Relevant projects
        </div>
        <div className="text-secondary-foreground text-base">
          Please add any contributions or links that demonstrate you meet the
          eligibility criteria outlined in the Security Council Charter:
        </div>
        <div className="text-secondary-foreground text-base">
          <ul className="list-disc ml-6 space-y-0">
            <li>
              Technical competency. Baseline proficiency with the OP Stack and
              secure key management and signing standards.
            </li>
            <li>
              Reputation. Known, trusted individuals or entities that have
              demonstrated consistent alignment with the Optimistic Vision.
            </li>
            <li>
              Geographic diversity. The number of participants that reside in
              any country should be less than the quorum required for multisig
              action. To avoid requiring participants to publicly disclose their
              physical locations, this requirement will be enforced by the
              Optimism Foundation as part of the eligibility screening process.
            </li>
            <li>
              Diversity of interests. No more than 1 participant is associated
              with a particular entity, or that entity&apos;s employees or
              affiliates.
            </li>
            <li>
              Alignment. Participants should not possess conflicts of interest
              that will regularly impact their ability to make impartial
              decisions in the performance of their role.
            </li>
          </ul>
        </div>
        <div className="text-secondary-foreground text-base">
          Projects that demonstrate your eligibility:
        </div>

        {/* Atlas Projects Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="font-medium text-sm text-foreground">
              Projects in Atlas
            </div>
            <ProjectSelectionModal
              userProjects={userProjects}
              selectedProjects={selectedProjects}
              isOpen={isProjectModalOpen}
              onOpenChange={setIsProjectModalOpen}
              onProjectSelect={handleProjectSelection}
            />
          </div>

          {selectedProjects.length === 0 ? (
            <button
              type="button"
              className="text-muted-foreground border border-tertiary rounded-md px-3 py-2.5 text-left w-full h-10 bg-background text-sm"
              onClick={() => setIsProjectModalOpen(true)}
            >
              None
            </button>
          ) : null}
        </div>

        {/* Selected Projects */}
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
                className="w-full min-h-[120px] pb-8 border-tertiary text-foreground text-sm resize-none focus-visible:ring-0"
                placeholder="How is this project relevant to your application? (optional)"
                maxLength={280}
                value={projectRelevanceText[project.project.id] || ""}
                onChange={(e) =>
                  handleProjectRelevanceChange(
                    project.project.id,
                    e.target.value,
                  )
                }
              />
              <div className="absolute bottom-3 left-3 text-xs text-muted-foreground">
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

        {/* External Links Section */}
        <div className="flex flex-col gap-2 w-full">
          <div className="font-medium text-sm text-foreground">Links</div>
          {externalLinks.length === 0 && (
            <div className="border border-tertiary rounded-xl p-6 flex flex-col gap-2 w-full">
              <Input
                className="h-10 border-tertiary bg-background"
                placeholder="Add a URL"
                onChange={(e) => {
                  if (e.target.value && externalLinks.length === 0) {
                    addExternalLink()
                    updateExternalLink(0, "url", e.target.value)
                  }
                }}
              />
              <div className="relative">
                <Textarea
                  className="w-full min-h-[120px] pb-8 border-tertiary text-sm resize-none focus-visible:ring-0"
                  placeholder="How is this link relevant to your application? (optional)"
                  maxLength={280}
                />
                <div className="absolute bottom-3 left-3 text-xs text-muted-foreground">
                  0/280
                </div>
              </div>
            </div>
          )}

          {externalLinks.map((link, index) => (
            <div
              key={index}
              className="border border-tertiary rounded-xl p-6 flex flex-col gap-2 w-full relative"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    className="flex-1 h-10 border-tertiary bg-background"
                    placeholder="Add a URL"
                    value={link.url}
                    onChange={(e) =>
                      updateExternalLink(index, "url", e.target.value)
                    }
                  />
                </div>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeExternalLink(index)}
                    className="p-1 rounded focus:outline-none absolute top-2 right-2"
                  >
                    <Close className="w-4 h-4" />
                  </button>
                )}
                <div className="relative">
                  <Textarea
                    className="w-full min-h-[120px] pb-8 border-tertiary text-sm resize-none focus-visible:ring-0"
                    placeholder="How is this link relevant to your application? (optional)"
                    maxLength={280}
                    value={link.description}
                    onChange={(e) =>
                      updateExternalLink(index, "description", e.target.value)
                    }
                  />
                  <div className="absolute bottom-3 left-3 text-xs text-muted-foreground">
                    <span
                      className={
                        link.description.length >= 280 ? "text-red-500" : ""
                      }
                    >
                      {link.description.length}/280
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            className="bg-[#f2f3f8] text-foreground border-0 w-fit"
            onClick={addExternalLink}
          >
            <AddFill className="w-4 h-4 mr-2" />
            Add another link
          </Button>
        </div>
      </div>

      {/* Disclosures Section */}
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <div className="text-xl font-semibold text-foreground">
            Disclosures
          </div>
          <div className="flex flex-col leading-6">
            <div className="font-medium text-base text-foreground">
              Please disclose any anticipated conflicts of interest, or verify
              that you have no conflicts of interest
            </div>
            <div className="text-secondary-foreground text-base">
              If you are a top 25 delegate in another ecosystem, hold an elected
              position in another DAO, and/or are a multisig signer in another
              community please disclose here.
            </div>
          </div>
          <div className="relative">
            <Textarea
              className="w-full min-h-[120px] pb-8 border-tertiary text-foreground text-sm resize-none focus-visible:ring-0"
              placeholder="Explain your conflicts of interest"
              maxLength={280}
              value={conflictsOfInterest}
              onChange={(e) => setConflictsOfInterest(e.target.value)}
            />
            <div className="absolute bottom-3 left-3 text-xs text-muted-foreground">
              <span
                className={
                  conflictsOfInterest.length >= 280 ? "text-red-500" : ""
                }
              >
                {conflictsOfInterest.length}/280
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="no-conflicts"
              checked={noConflictsChecked}
              onCheckedChange={(checked) => setNoConflictsChecked(!!checked)}
              className="w-6 h-6"
            />
            <label htmlFor="no-conflicts" className="text-base text-foreground">
              I have no conflicts of interest
            </label>
          </div>
        </div>

        {/* Security Council Terms */}
        {SECURITY_ROLE_TERMS.map((term, index) => (
          <div key={index} className="flex flex-col gap-6">
            <div className="font-medium text-base text-foreground">
              {term}
              {index === 2 && (
                <div className="font-normal text-secondary-foreground mt-1">
                  Note that there is an &quot;on-call&quot; aspect to this role
                  not fully encompassed in the active hours estimate.
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`security-term-${index}`}
                checked={securityCouncilTermsChecked[index] || false}
                onCheckedChange={() => handleSecurityCouncilTermsChange(index)}
                className="w-6 h-6"
              />
              <label
                htmlFor={`security-term-${index}`}
                className="text-base text-foreground"
              >
                {index === 2
                  ? "I am able to commit ~5 active hours per month to Security Council operations"
                  : "I understand"}
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        className="bg-brand-primary text-foreground disabled:opacity-30 hover:opacity-100 transition-opacity"
        disabled={!requirementsSatisfied || isLoading}
      >
        {isLoading ? "Submitting..." : "Submit"}
      </Button>
    </div>
  )
}
