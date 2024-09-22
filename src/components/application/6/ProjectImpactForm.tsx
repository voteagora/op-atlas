import { CheckedState } from "@radix-ui/react-checkbox"
import Image from "next/image"
import React, { memo, useEffect, useMemo } from "react"
import { UseFormReturn, useWatch } from "react-hook-form"
import { z } from "zod"

import { Badge } from "@/components/common/Badge"
import { Callout } from "@/components/common/Callout"
import ExternalLink from "@/components/ExternalLink"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField, FormItem, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { CategoryWithImpact, ProjectWithDetails } from "@/lib/types"
import { EAS_URL_PREFIX, getProjectStatus } from "@/lib/utils"

import { ApplicationFormSchema } from "./ApplicationFormTabs"

const ProjectImpactForm = ({
  project,
  categories,
  form,
  index,
}: {
  project: ProjectWithDetails
  form: UseFormReturn<z.infer<typeof ApplicationFormSchema>>
  categories: CategoryWithImpact[]
  index: number
}) => {
  const isEligible = useMemo(() => {
    return getProjectStatus(project).progressPercent === 100
  }, [project])

  const hasApplied = project.applications[0]?.status === "submitted"
  const attestationId = project.applications[0]?.attestationId

  const categoryId = useWatch({ name: `projects.${index}.category` })
  const selectedOption = useWatch({
    name: `projects.${index}.projectDescriptionOptions`,
  })

  const selectedCategory = categories.find(
    (category) => category.id === categoryId,
  )

  const isGovNERDs = selectedOption[0]?.includes("GovNERDs")

  console.log("Selected Category:", selectedCategory)
  console.log("Selected Option:", selectedOption)

  useEffect(() => {
    const watchedProjects = form.getValues("projects")

    watchedProjects.forEach((project, index: number) => {
      const selectedCategory = categories.find(
        (category) => category.id === project.category,
      )
      if (selectedCategory) {
        // Update the impactStatement object with new fields
        const updatedImpactStatements =
          selectedCategory.impactStatements.reduce(
            (acc: Record<string, string>, statement) => {
              acc[statement.id] = project.impactStatement[statement.id] || ""
              return acc ?? { "1": "", "2": "" }
            },
            {},
          )
        // Update the form state with the new impactStatement structure
        form.setValue(
          `projects.${index}.impactStatement`,
          updatedImpactStatements,
          { shouldValidate: true },
        )
        form.setValue(`projects.${index}.selected`, true)
      }
    })
  }, [categories, categoryId, form])

  const isIneligible = !isEligible

  return (
    <div className="p-8 border border-input rounded-xl">
      <Accordion
        type="single"
        collapsible
        disabled={isIneligible}
        className="w-full"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="!p-0">
            <div className="flex gap-4 items-center w-full">
              <FormField
                name={`projects.${index}.selected`}
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    disabled={isIneligible || hasApplied}
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

              {hasApplied && (
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
              )}
            </div>
          </AccordionTrigger>

          <AccordionContent className="pb-0">
            <div className="mt-12 flex flex-col gap-y-12">
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
                  Describe this project&apos;s impact on the OP Stack from Oct
                  1, 2023 - July 31, 2024. Please only describe the impact that
                  was delivered during that specific time period.
                </p>
                <p className="text-sm text-secondary-foreground">
                  You&apos; ve already given your project a description in your{" "}
                  <ExternalLink
                    href={`/projects/${project.id}/details`}
                    className="underline"
                  >
                    project setup
                  </ExternalLink>
                  . There&apos;s no need to repeat that information here.
                  Instead, focus on communicating your project&apos;s impact.
                </p>
                <Callout
                  className="!text-sm"
                  type="info"
                  text="Promises of future deliverables or impact are not allowed."
                />

                {selectedCategory?.name === "Governance Leadership" &&
                  selectedCategory.roundId === "6" && (
                    <>
                      {isGovNERDs && (
                        <div className="mb-6">
                          <h6 className="text-sm font-medium mb-2">
                            In what season did your work take place
                            <span className="text-destructive">*</span>
                          </h6>
                          <p className="text-sm text-secondary-foreground mb-4">
                            If you represent a council/committee/board or
                            similar, please submit one project and application
                            per governance season.
                          </p>
                          <FormField
                            control={form.control}
                            name="governance_impact"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <div className="flex items-center space-x-2 border rounded-sm p-4">
                                  <Checkbox
                                    id="season5"
                                    checked={field.value === "Season 5"}
                                    onCheckedChange={() =>
                                      field.onChange("Season 5")
                                    }
                                  />
                                  <label htmlFor="season5" className="text-sm">
                                    Season 5: Sept 28th 2023 - May 8th 2024
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-sm p-4">
                                  <Checkbox
                                    id="season6"
                                    checked={field.value === "Season 6"}
                                    onCheckedChange={() =>
                                      field.onChange("Season 6")
                                    }
                                  />
                                  <label htmlFor="season6" className="text-sm">
                                    Season 6: May 9th - September 18th 2024 (up
                                    until Voting Cycle #28)
                                  </label>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Existing impact statements rendering */}
                      {(() => {
                        console.log(
                          "Impact Statements before filter:",
                          selectedCategory.impactStatements,
                        )

                        const filteredStatements =
                          selectedCategory.impactStatements.filter(
                            (statement) => {
                              if (isGovNERDs) {
                                return (
                                  statement.question.includes(
                                    "What is the mandate",
                                  ) ||
                                  statement.question.includes(
                                    "How did your work achieve",
                                  )
                                )
                              } else {
                                return statement.question.includes(
                                  "How has your facilitation work improved",
                                )
                              }
                            },
                          )

                        console.log(
                          "Filtered Impact Statements:",
                          filteredStatements,
                        )
                        return filteredStatements.map((impactStatement) => (
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
                                    <div className="absolute bottom-2.5 left-3 text-[10px] text-muted-foreground flex gap-2">
                                      <span>{field?.value?.length}/1000</span>
                                      <span>•</span>
                                      <span>Markdown is supported</span>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))
                      })()}
                    </>
                  )}

                {selectedCategory?.name !== "Governance Leadership" &&
                  selectedCategory?.impactStatements
                    .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))
                    .map((impactStatement) => (
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
                                <div className="absolute bottom-2.5 left-3 text-[10px] text-muted-foreground flex gap-2">
                                  <span>{field?.value?.length}/1000</span>
                                  <span>•</span>
                                  <span>Markdown is supported</span>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

const CategoryItem = ({
  category: { description, name, options, imageUrl, roundId },
  value,
  selectedValue,
  form,
  index,
}: {
  selectedValue: string
  value: string
  category: CategoryWithImpact
  index: number
  form: UseFormReturn<z.infer<typeof ApplicationFormSchema>>
}) => {
  const isGovernanceLeadership =
    name === "Governance Leadership" && roundId === "6"

  return (
    <div className="p-6 border border-input rounded-xl">
      <div className="flex items-start gap-4">
        <span className="mt-1">
          <RadioGroupItem value={value} />
        </span>

        <div className="flex-grow">
          <h6 className="text-sm font-medium">{name}</h6>
          <p className="text-sm text-secondary-foreground">{description}</p>
        </div>
        <div className="min-w-[64px] h-[64px] flex justify-center items-center rounded-2xl">
          <Image
            src={imageUrl ?? ""}
            alt={name}
            width={64}
            height={64}
            className="rounded-2xl"
          />
        </div>
      </div>
      {selectedValue === value && (
        <div className="flex flex-col gap-y-1.5 pl-8 w-full mt-4">
          <h5 className="text-sm font-medium text-foreground w-full">
            Which option describes your project?
            <span className="text-destructive">*</span>
          </h5>

          <FormField
            control={form.control}
            name={`projects.${index}.projectDescriptionOptions`}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                {/* If Governance Leadership, we are going to put in 
                radio boxes and then swap out the impact statements, 
                else, we will show the check boxes with the same impact 
                statements based o nthe category. This is a Round 6 specific thing, will want to 
                generalize later for future rounds. */}
                {isGovernanceLeadership ? (
                  <RadioGroup
                    onValueChange={(value) => field.onChange([value])}
                    value={field.value[0]}
                    className="space-y-3"
                  >
                    {options.map((option) => {
                      const [title, description] = option.includes("::")
                        ? option.split("::")
                        : [option, ""]

                      return (
                        <div
                          key={option}
                          className="py-3 px-4 flex items-start gap-x-4 border border-input rounded-lg w-full"
                        >
                          <RadioGroupItem
                            value={option}
                            id={option}
                            className="w-10 h-5"
                          />
                          <div className="flex-grow">
                            <label
                              htmlFor={option}
                              className="text-sm font-medium"
                            >
                              {title}
                            </label>
                            {description && (
                              <p className="text-sm text-secondary-foreground mt-1">
                                {description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </RadioGroup>
                ) : (
                  options.map((option) => {
                    const [title, description] = option.includes("::")
                      ? option.split("::")
                      : [option, ""]

                    return (
                      <div
                        key={option}
                        className="py-3 px-4 flex items-start gap-x-4 border border-input rounded-lg w-full"
                      >
                        <Checkbox
                          checked={field.value.includes(option)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, option]
                              : field.value.filter((id) => id !== option)
                            field.onChange(newValue)
                          }}
                          className="w-5 h-5 mt-0.5"
                        />
                        <div className="flex-grow">
                          <p className="text-sm font-medium">{title}</p>
                          {description && (
                            <p className="text-sm text-secondary-foreground mt-1">
                              {description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}

export default memo(ProjectImpactForm)
