"use client"
import { ProjectWithDetails } from "@/lib/types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from "next/image"
import ExternalLink from "../ExternalLink"
import { Callout } from "../common/Callout"
import { Badge } from "../ui/badge"

import { FormField } from "../ui/form"
import { Checkbox } from "../ui/checkbox"
import { useForm } from "react-hook-form"
import { ApplicationFormSchema } from "../application/5/ApplicationFormTabs"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { getProjectStatus, ProjectSection } from "@/lib/utils"
import { useMemo } from "react"
import {
  Check,
  ChevronRight,
  Circle,
  CircleCheck,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "../ui/button"
import { notFound, useRouter } from "next/navigation"
import { FUNDING_ROUNDS, FundingRound } from "@/lib/mocks"
import CircleWithCheckmark from "../common/CircleWithGreenCheckmark"
import { getUserApplications } from "@/db/projects"
import { useSession } from "next-auth/react"
import { EnrolledProjectsCard } from "./EnrolledProjectsCard"
import { BlueBadge } from "./common/badges/BlueBadge"
import { GreenBadge } from "./common/badges/GreenBadge"
import { RedBadge } from "./common/badges/RedBadge"

export const ProjectApplication = ({
  round,
  project,
  index,
  form,
  isApplicationPresent,
}: {
  round: FundingRound
  project: ProjectWithDetails
  index: number
  form: any
  isApplicationPresent: boolean
}) => {
  const { progressPercent, completedSections } = useMemo(() => {
    return project
      ? getProjectStatus(project)
      : { progressPercent: 0, completedSections: [] }
  }, [project])

  const router = useRouter()

  const projectRequirements: ProjectSection[] = [
    ProjectSection.Details,
    ProjectSection.Contributors,
    ProjectSection.Repos,
    ProjectSection.Contracts,
    ProjectSection.Publish,
  ]

  const allRequirementsMet = projectRequirements.every((section) =>
    completedSections.includes(section),
  )

  // console.log(allRequirementsMet)

  let eligibility = false

  if (round.number === 7) {
    eligibility =
      project.hasCodeRepositories &&
      project.repos.every((repo: any) => {
        return repo.verified
      })
  } else if (round.number === 8) {
    eligibility = project.isOnChainContract && project.contracts.length > 0
  }

  const allEligibilityMet =
    project.hasCodeRepositories && project.repos.length > 0 && eligibility

  // console.log(allEligibilityMet)

  const requirementStatus = projectRequirements.reduce((acc, requirement) => {
    acc[requirement] = completedSections.includes(requirement)
    return acc
  }, {} as Record<string, boolean>)

  const setupTitles = {
    Details: "Project details",
    Contributors: "Contributors",
    Repos: "Repos & Links",
    Contracts: "Contracts",
    Publish: "Publish metadata onchain",
  }

  const isActive = isApplicationPresent
  // const isPending = false
  const isIncomplete = !allRequirementsMet
  const isNotEligible = !allEligibilityMet

  const incompleteBadge = <RedBadge text="Incomplete" />
  const notEligibleBadge = <RedBadge text="Not eligible" />
  const activeBadge = <GreenBadge showIcon={true} />

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

            {Object.entries(requirementStatus).map(([key, value]) => {
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
                    <span>{setupTitles[key as keyof typeof setupTitles]}</span>
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
              const criteriaCompletion = allEligibilityMet

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
