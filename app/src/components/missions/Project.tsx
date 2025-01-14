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
import { FUNDING_ROUNDS } from "@/lib/mocks"
import { FundingRound } from "@/lib/roundsData"

export const Project = ({
  round,
  project,
  index,
}: {
  round: FundingRound
  project: ProjectWithDetails
  index: number
}) => {
  const { progressPercent, completedSections } = useMemo(() => {
    return project
      ? getProjectStatus(project)
      : { progressPercent: 0, completedSections: [] }
  }, [project])

  const router = useRouter()
  const form = useForm<z.infer<typeof ApplicationFormSchema>>({
    resolver: zodResolver(ApplicationFormSchema),
    defaultValues: {
      projects: [],
    },
    shouldFocusError: true,
    mode: "onChange",
  })

  const projectRequirements: ProjectSection[] = [
    ProjectSection.Details,
    ProjectSection.Contributors,
    ProjectSection.Repos,
    ProjectSection.Contracts,
    ProjectSection.Publish,
  ]

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

  const isActive = false
  const isPending = false
  const isIncomplete = false
  const isNotEligible = false

  //   let projectState: "" | "Active" | "Pending" | "Incomplete" | "Not Eligible" =
  //     ""

  const incompleteBadge = (
    <Badge
      className={`text-xs font-medium text-rose-800 border-0 ${"bg-rose-200"}`}
      variant={"outline"}
    >
      {"Incomplete"}
    </Badge>
  )

  const notEligibleBadge = (
    <Badge
      className={`text-xs font-medium text-rose-800 border-0 ${"bg-rose-200"}`}
      variant={"outline"}
    >
      {"Not eligible"}
    </Badge>
  )

  const pendingBadge = (
    <Badge
      className={`text-xs font-medium text-blue-800 border-0 gap-1 ${"bg-calloutAlternative-foreground"}`}
      variant={"outline"}
    >
      <Loader2 width={16} height={15} />
      {"Pending approval"}
    </Badge>
  )

  const activeBadge = (
    <Badge
      className={`text-xs font-medium text-green-800 border-0 bg-green-100`}
      variant={"outline"}
    >
      <Check width={12} height={12}></Check>
      {"Active"}
    </Badge>
  )

  let selectedBadge

  if (isActive) {
    selectedBadge = activeBadge
  } else if (isPending) {
    selectedBadge = pendingBadge
  } else if (isNotEligible) {
    selectedBadge = notEligibleBadge
  } else if (isIncomplete) {
    selectedBadge = incompleteBadge
  }

  const isValid = !isActive && !isPending && !isNotEligible && !isIncomplete

  return (
    <div className="p-8 border border-input rounded-xl">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="!p-0">
            <div className="flex gap-6 items-center w-full justify-between">
              <div className="flex gap-6 items-center">
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
                console.log("aye")
                icon = <X className="w-5 h-5" color="gray" />
              } else {
                icon = (
                  <div className="relative w-32 h-32">
                    <Circle
                      className="absolute top-0 left-0 w-full h-full"
                      color="green"
                      fill="green"
                    />
                    <Check
                      className="absolute top-0 left-0 w-full h-full p-1"
                      color="white"
                      strokeWidth={4}
                    />
                  </div>
                )
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
              const criteriaCompletion = false
              let icon

              if (!criteriaCompletion) {
                if (criterion.situational) {
                  icon = <div className="w-full h-[3px] bg-gray-400 m-1" />
                } else {
                  icon = <X className="w-5 h-5" color="gray" />
                }
              } else {
                icon = icon = (
                  <div className="relative w-32 h-32">
                    <Circle
                      className="absolute top-0 left-0 w-full h-full"
                      color="green"
                      fill="green"
                    />
                    <Check
                      className="absolute top-0 left-0 w-full h-full p-1"
                      color="white"
                      strokeWidth={4}
                    />
                  </div>
                )
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

            {/* <div className="mt-12 flex flex-col gap-y-12">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold text-text-default">
                  Category
                </h3>
                <h5 className="text-sm font-medium text-foreground mt-4">
                  Choose a category of impact for this project
                  <span className="text-destructive">*</span>
                </h5>
                <FormField
                    control={form.control}
                    name={`projects.${index}.category`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          {categories.map((category) => {
                            return (
                              <CategoryItem
                                key={category.id}
                                value={category.id}
                                selectedValue={field.value}
                                category={category}
                                index={index}
                                form={form}
                              />
                            )
                          })}
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                <p className="text-sm text-secondary-foreground ">
                  Unsure which category to choose?
                  <ExternalLink
                    className="underline"
                    href="https://discord.com/invite/optimism"
                  >
                    {" "}
                    Get help in Discord.
                  </ExternalLink>
                </p>
              </div>

              <div className="flex flex-col gap-6">
                <h4 className="text-xl font-semibold text-text-default">
                  Impact statement
                </h4>
                <p className="text-sm text-secondary-foreground">
                  Describe this project’s impact on the OP Stack from Oct 1,
                  2023 - July 31, 2024. Please only describe the impact that was
                  delivered during that specific time period.
                </p>
                <p className="text-sm text-secondary-foreground">
                  You’ve already given your project a description in your{" "}
                  <ExternalLink
                    href={`/projects/${project.id}/details`}
                    className="underline"
                  >
                    project setup
                  </ExternalLink>
                  . There’s no need to repeat that information here. Instead,
                  focus on communicating your project’s impact.
                </p>
                <Callout
                  className="!text-sm"
                  type="info"
                  text="Promises of future deliverables or impact are not allowed."
                />

                {categories
                    .find((category) => category.id === categoryId)
                    ?.impactStatements.map((impactStatement) => (
                      <div key={impactStatement.id}>
                        <h6 className="text-sm font-medium">
                          {impactStatement.question}
                          <span className="text-destructive">*</span>
                        </h6>
                        <p className="text-sm text-secondary-foreground mb-2">
                          {impactStatement.subtext}
                        </p>
  
                        <FormField
                          control={form.control}
                          name={`projects.${index}.impactStatement.${impactStatement.id}`}
                          render={({ field }) => (
                            <FormItem className="relative">
                              <div className="relative">
                                <Textarea
                                  {...field}
                                  className="min-h-60"
                                  placeholder="Add a response"
                                />
                                <span className="absolute bottom-2.5 left-3 text-[10px] text-muted-foreground">
                                  {field?.value?.length}/1000
                                </span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
              </div>
            </div> */}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
