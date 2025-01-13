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
import { Badge } from "../common/Badge"
import { FormField } from "../ui/form"
import { Checkbox } from "../ui/checkbox"
import { useForm } from "react-hook-form"
import { ApplicationFormSchema } from "../application/5/ApplicationFormTabs"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { getProjectStatus, ProjectSection } from "@/lib/utils"
import { useMemo } from "react"
import { Check, ChevronRight, Circle, CircleCheck, X } from "lucide-react"
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

  const isDisabled = false

  console.log(completedSections)
  console.log(project)

  const router = useRouter()
  const form = useForm<z.infer<typeof ApplicationFormSchema>>({
    resolver: zodResolver(ApplicationFormSchema),
    defaultValues: {
      projects: [],
    },
    shouldFocusError: true,
    mode: "onChange",
  })

  console.log(round)

  const projectRequirements: ProjectSection[] = [
    ProjectSection.Details,
    ProjectSection.Contributors,
    ProjectSection.Repos,
    ProjectSection.Contracts,
    ProjectSection.Publish,
  ]

  const userData = ["Details", "Contributors", "Repos"]

  const requirementStatus = projectRequirements.reduce((acc, requirement) => {
    acc[requirement] = completedSections.includes(requirement)
    return acc
  }, {} as Record<string, boolean>)

  console.log(requirementStatus)

  const setupTitles = {
    Details: "Project details",
    Contributors: "Contributors",
    Repos: "Repos & Links",
    Contracts: "Contracts",
    Publish: "Publish metadata onchain",
  }

  const projectRequirementsCompletedTitles = projectRequirements.map(
    (requirement: any) => {
      type KeyType = keyof typeof setupTitles // "Details" | "Contributors" | "Repos" | "Contracts" | "Publish"
      const isCompleted = completedSections.find((section) => {
        return requirement === section
      })

      return isCompleted ? (
        <div>{setupTitles[requirement as KeyType]}</div>
      ) : (
        <div>{setupTitles[requirement as KeyType]}</div>
      )
    },
  )

  return (
    <div className="p-8 border border-input rounded-xl">
      <Accordion type="single" collapsible disabled={false} className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="!p-0">
            <div className="flex gap-4 items-center w-full">
              <FormField
                name={`projects.${index}.selected`}
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    disabled={isDisabled}
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

              {/* {hasApplied && (
                <ExternalLink
                  href={`${EAS_URL_PREFIX}${attestationId}`}
                  className="ml-auto flex items-center gap-1 mr-2"
                >
                  <Image
                    alt="Checkmark"
                    src="/assets/icons/circle-check-green.svg"
                    height={11.6}
                    width={11.6}
                  />
                  <p className="font-medium text-sm text-success-foreground">
                    View attestation
                  </p>
                </ExternalLink>
              )}

              {isIneligible && !hasApplied && (
                <Badge size="lg" text="Not eligible" className="ml-auto" />
              )} */}
            </div>
          </AccordionTrigger>

          <AccordionContent className="pb-0">
            <p>Project Setup</p>

            {Object.entries(requirementStatus).map(([key, value]) => {
              let icon

              if (!value) {
                icon = <X className="w-5 h-5" color="gray" />
              } else {
                icon = (
                  <>
                    <CircleCheck
                      className="absolute w-full h-full"
                      color="green"
                      fill="green"
                    />
                    <Check
                      className="absolute w-3 h-3"
                      color="white"
                      strokeWidth={3}
                    />
                  </>
                )
              }

              return (
                <div className="flex items-center" key={key}>
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    {icon}
                  </div>
                  <p>
                    <span>{key}</span>
                  </p>
                </div>
              )
            })}

            {
              //  Object.entries(requirementStatus).map(([key:, value]:) => (
              //     <div key={key}>
              //       {key}: {value ? "Enabled" : "Disabled"}
              //     </div>
              //   ))
              //   <div className="flex items-center">
              //     <div className="relative w-5 h-5 flex items-center justify-center">
              //       {icon}
              //     </div>
              //     <p>
              //       <span>{criterion.name}</span>
              //       {criterion.category && (
              //         <span>
              //           {": " +
              //             criterion.category +
              //             " - Checked after application is submitted"}
              //         </span>
              //       )}
              //     </p>
              //   </div>
            }
            <div className="flex">
              <div className="relative w-5 h-5 flex items-center justify-center">
                <CircleCheck
                  className="absolute w-full h-full"
                  color="green"
                  fill="green"
                />
                <Check
                  className="absolute w-3 h-3"
                  color="white"
                  strokeWidth={3}
                />
              </div>

              <p>Project Details</p>
            </div>

            <Button
              variant={"ghost"}
              onClick={() => {
                router.push(`/projects/${project.id}/details`)
              }}
            >
              Edit project
              <ChevronRight />
            </Button>

            <p>Eligibility Criteria</p>

            {round.eligibility.criteria.map((criterion: any) => {
              const criteriaCompletion = false
              let icon

              if (!criteriaCompletion) {
                if (criterion.situational) {
                  icon = <div className="w-full h-[3px] bg-gray-400 m-1" />
                } else {
                  icon = <X className="w-5 h-5" color="gray" />
                }
              } else {
                icon = (
                  <>
                    <CircleCheck
                      className="absolute w-full h-full"
                      color="green"
                      fill="green"
                    />
                    <Check
                      className="absolute w-3 h-3"
                      color="white"
                      strokeWidth={3}
                    />
                  </>
                )
              }

              return (
                <div className="flex items-center">
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    {icon}
                  </div>
                  <p>
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
