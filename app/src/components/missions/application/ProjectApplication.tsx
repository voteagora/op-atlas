"use client"
import { ProjectWithDetails } from "@/lib/types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from "next/image"
import { FormField } from "../../ui/form"
import { Checkbox } from "../../ui/checkbox"
import { getProjectStatus, ProjectSection } from "@/lib/utils"
import { useMemo } from "react"
import { ChevronRight, X } from "lucide-react"
import { Button } from "../../ui/button"
import { useRouter } from "next/navigation"
import { FundingRound } from "@/lib/mocks"
import CircleWithCheckmark from "../../common/CircleWithGreenCheckmark"
import { GreenBadge } from "../common/badges/GreenBadge"
import { RedBadge } from "../common/badges/RedBadge"

const incompleteBadge = <RedBadge text="Incomplete" />
const notEligibleBadge = <RedBadge text="Not eligible" />
const activeBadge = <GreenBadge showIcon={true} />

const sectionsTitles = {
  Details: "Project details",
  Contributors: "Contributors",
  Repos: "Repos & Links",
  Contracts: "Contracts",
  Publish: "Publish metadata onchain",
}

const sectionsCriteria: ProjectSection[] = [
  ProjectSection.Details,
  ProjectSection.Contributors,
  ProjectSection.Repos,
  ProjectSection.Contracts,
  ProjectSection.Publish,
]

export const ProjectApplication = ({
  round,
  project,
  index,
  form,
  isAppliedToRound,
}: {
  round: FundingRound
  project: ProjectWithDetails
  index: number
  form: any
  isAppliedToRound: boolean
}) => {
  const router = useRouter()

  const { progressPercent, completedSections: completedSectionsCriteria } =
    useMemo(() => {
      return project
        ? getProjectStatus(project)
        : { progressPercent: 0, completedSections: [] }
    }, [project])

  const roundEligibilityCriteriaChecks = round.eligibility.criteria.map(() => {
    return true
  })

  for (let i = 0; i < round.eligibility.criteria.length; i++) {
    var criterion = round.eligibility.criteria[i]

    if (criterion.type === "hasCodeRepositories") {
      roundEligibilityCriteriaChecks[i] =
        project.hasCodeRepositories &&
        project.repos.every((repo: any) => {
          return repo.verified
        })
    }

    if (criterion.type === "isOnChainContract") {
      roundEligibilityCriteriaChecks[i] =
        project.isOnChainContract && project.contracts.length > 0
    }
  }

  const isSectionsCriteriaMet = sectionsCriteria.reduce(
    (sections, criterion) => {
      sections[criterion] = completedSectionsCriteria.includes(criterion)
      return sections
    },
    {} as Record<string, boolean>,
  )

  const isActive = isAppliedToRound
  const isIncomplete = !sectionsCriteria.every((section) =>
    completedSectionsCriteria.includes(section),
  )
  const isNotEligible = !roundEligibilityCriteriaChecks.every(
    (check: boolean) => check,
  )

  let selectedBadge

  if (isActive) {
    selectedBadge = activeBadge
  }
  // else if (isPending) {
  //   selectedBadge = pendingBadge
  // }
  else if (isNotEligible) {
    selectedBadge = notEligibleBadge
  } else if (isIncomplete) {
    selectedBadge = incompleteBadge
  }

  const isValid = !isActive && !isNotEligible && !isIncomplete //&& !isPending

  return (
    <div className="p-8 border border-input rounded-xl">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="!p-0">
            <div className="flex gap-6 items-center w-full justify-between">
              <div className="flex gap-6 items-center">
                <div
                  onClick={(e) => e.stopPropagation()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation()
                    }
                  }}
                >
                  <FormField
                    name={`projects.${index}.selected`}
                    control={form.control}
                    render={({ field }) => (
                      <Checkbox
                        disabled={!isValid}
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <Image
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-sm"
                  src={
                    project?.thumbnailUrl ??
                    "/assets/images/social-share-background.png"
                  }
                  alt=""
                />
                <div className="flex flex-col text-start">
                  <h5 className="text-base font-semibold text-secondary-foreground truncate w-96 ">
                    {project.name}
                  </h5>
                  <p>Admin</p>
                </div>
              </div>

              {selectedBadge}
            </div>
          </AccordionTrigger>

          <AccordionContent className="pl-10 pt-5">
            <p className="font-bold pb-2">Project Setup</p>

            {Object.entries(isSectionsCriteriaMet).map(([key, value]) => {
              let icon

              if (!value) {
                // console.log("aye")
                icon = <X className="w-5 h-5" color="gray" />
              } else {
                icon = icon = <CircleWithCheckmark />
              }

              return (
                <div className="flex items-center py-1" key={key}>
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    {icon}
                  </div>
                  <p className="pl-4">
                    <span>
                      {sectionsTitles[key as keyof typeof sectionsTitles]}
                    </span>
                  </p>
                </div>
              )
            })}

            <Button
              className="p-0"
              variant={"ghost"}
              onClick={() => {
                router.push(`/projects/${project.id}/details`)
              }}
            >
              Edit project
              <ChevronRight />
            </Button>

            <p className="font-bold pt-5 pb-2">Eligibility Criteria</p>

            {round.eligibility.criteria.map((criterion: any, index: number) => {
              const criteriaCompletion = roundEligibilityCriteriaChecks[index]

              let icon

              if (!criteriaCompletion) {
                if (criterion.situational) {
                  icon = <div className="w-full h-[3px] bg-gray-400 m-1" />
                } else {
                  icon = <X className="w-5 h-5" color="gray" />
                }
              } else {
                icon = <CircleWithCheckmark />
              }

              return (
                <div
                  className="flex items-center py-1"
                  key={"criterion-" + index}
                >
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    {icon}
                  </div>
                  <p className="pl-4">
                    <span>{criterion.name}</span>
                    {criterion.category && (
                      <span>
                        {": " +
                          criterion.category +
                          " - Checked after application is submitted"}
                      </span>
                    )}
                  </p>
                </div>
              )
            })}

            <Button
              className="p-0"
              variant={"ghost"}
              onClick={() => {
                router.push(`/projects/${project.id}/details`)
              }}
            >
              Edit project
              <ChevronRight />
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
