"use client"
import { X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"
import { useProjectContracts } from "@/hooks/db/useProjectContracts"
import { useSessionRoundApplications } from "@/hooks/db/useUserRoundApplications"
import { ProjectWithDetails } from "@/lib/types"
import { getProjectStatus, ProjectSection } from "@/lib/utils"

import CircleWithCheckmark from "../../common/CircleWithGreenCheckmark"
import { Button } from "../../ui/button"
import { Checkbox } from "../../ui/checkbox"
import { FormField } from "../../ui/form"
import { GreenBadge } from "../common/badges/GreenBadge"
import { RedBadge } from "../common/badges/RedBadge"
import { ApplicationFormSchema } from "./MissionApplication"

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
  project,
  index,
  form,
  isAppliedToRound,
}: {
  project: ProjectWithDetails
  index: number
  form: UseFormReturn<z.infer<typeof ApplicationFormSchema>>
  isAppliedToRound: boolean
}) => {
  const round = useMissionFromPath()

  const router = useRouter()

  const { isLoading } = useSessionRoundApplications(round?.number)

  const { data: contracts } = useProjectContracts(project.id)

  const { progressPercent, completedSections: completedSectionsCriteria } =
    useMemo(() => {
      return project
        ? getProjectStatus(project, contracts ?? null)
        : { progressPercent: 0, completedSections: [] }
    }, [project, contracts])

  const roundEligibilityCriteriaChecks = round!.applicationPageEligibility.map(
    () => {
      return true
    },
  )

  for (let i = 0; i < round!.applicationPageEligibility.length; i++) {
    const criterion = round!.applicationPageEligibility[i]

    if (criterion.type && criterion.type === "hasCodeRepositories") {
      roundEligibilityCriteriaChecks[i] =
        project.hasCodeRepositories && project.repos.length > 0
    }

    if (criterion.type && criterion.type === "isOnChainContract") {
      roundEligibilityCriteriaChecks[i] =
        (contracts?.contracts?.length ?? 0) > 0 ||
        !!project.openSourceObserverSlug
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
  const isNotEligible =
    !roundEligibilityCriteriaChecks.every((check: boolean) => check) ||
    !sectionsCriteria.every((section) =>
      completedSectionsCriteria.includes(section),
    )

  let enrollmentStatusBadge

  if (isActive) {
    enrollmentStatusBadge = activeBadge
  } else if (isNotEligible) {
    enrollmentStatusBadge = notEligibleBadge
  }

  const isValidForEnrollment = !isActive && !isNotEligible

  return (
    <div className="p-8 border border-input rounded-xl my-4">
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
                        disabled={!isValidForEnrollment || isLoading}
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
                  <h5 className="font-semibold text-primary truncate w-96">
                    {project.name}
                  </h5>
                  {project.organization?.organization.name && (
                    <p>{project.organization?.organization.name}</p>
                  )}
                </div>
              </div>

              {enrollmentStatusBadge}
            </div>
          </AccordionTrigger>

          <AccordionContent className="pl-10 pt-5">
            <p className="font-bold pb-2">Project Setup</p>

            {Object.entries(isSectionsCriteriaMet).map(([key, value]) => {
              let icon

              if (!value) {
                icon = <X className="w-5 h-5" color="red" />
              } else {
                icon = icon = <CircleWithCheckmark />
              }

              return (
                <div className="flex items-center py-1" key={key}>
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    {icon}
                  </div>
                  <p className="pl-4">
                    <span className="text-secondary-foreground">
                      {sectionsTitles[key as keyof typeof sectionsTitles]}
                    </span>
                  </p>
                </div>
              )
            })}

            <p className="font-bold pt-5 pb-2">Eligibility Criteria</p>

            {round!.applicationPageEligibility.map(
              (
                criterion: { reactNode: React.ReactNode; type?: string },
                index: number,
              ) => {
                const isCriterionComplete =
                  roundEligibilityCriteriaChecks[index]

                let icon

                if (criterion.type) {
                  if (criterion.type === "hasJavaScriptAndOrRustPackages") {
                    if (
                      project.repos.some(
                        (repo) => repo.npmPackage || repo.crate,
                      )
                    ) {
                      icon = <CircleWithCheckmark />
                    } else {
                      icon = <div className="w-6 h-[3px] bg-gray-400 m-1" />
                    }
                  } else {
                    if (isCriterionComplete) {
                      icon = <CircleWithCheckmark />
                    } else {
                      icon = <X className="w-6 h-6" color="red" />
                    }
                  }
                } else {
                  icon = <div className="w-6 h-[3px] bg-gray-400 m-1" />
                }

                return (
                  <div
                    className="flex items-center py-1 gap-2"
                    key={"criterion-" + index}
                  >
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      {icon}
                    </div>
                    {criterion.reactNode}
                  </div>
                )
              },
            )}

            <Button
              variant={"ghost"}
              className="bg-secondary"
              onClick={() => {
                router.push(`/projects/${project.id}/details`)
              }}
            >
              Edit project
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
