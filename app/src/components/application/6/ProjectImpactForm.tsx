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
import { useProjectContracts } from "@/hooks/db/useProjectContracts"
import { useProjectDetails } from "@/hooks/db/useProjectDetails"
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
  const { data: contracts } = useProjectContracts(project.id)
  const { data: projectDetails } = useProjectDetails(project.id)

  const isEligible = useMemo(() => {
    return (
      getProjectStatus(projectDetails ?? null, contracts ?? null)
        .progressPercent === 100
    )
  }, [projectDetails, contracts])

  const hasApplied = project.applications[0]?.status === "submitted"
  const attestationId = project.applications[0]?.attestationId

  const watchedCategoryId = useWatch({ name: `projects.${index}.category` })
  const watchedProjectDescriptionOptions = useWatch({
    name: `projects.${index}.projectDescriptionOptions`,
  })
  const watchedImpactStetements = useWatch({
    name: `projects.${index}.impactStatement`,
  })

  useEffect(() => {
    const selectedCategory = categories.find(
      (category) => category.id === watchedCategoryId,
    )

    if (selectedCategory) {
      // Update the impactStatement object with new fields
      const updatedImpactStatements = selectedCategory.impactStatements.reduce(
        (acc: Record<string, string>, statement) => {
          if (statement.limitToCategoryOptions.length > 0) {
            if (
              statement.limitToCategoryOptions.some((option) =>
                watchedProjectDescriptionOptions.includes(
                  selectedCategory.options[option],
                ),
              )
            ) {
              acc[statement.id] = watchedImpactStetements[statement.id] || ""
            }
            return acc
          }
          acc[statement.id] = watchedImpactStetements[statement.id] || ""
          return acc
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
  }, [categories, watchedCategoryId, form, watchedProjectDescriptionOptions])

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
                <h5 className="text-base font-normal text-secondary-foreground truncate w-96 ">
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
                  <p className="font-normal text-sm text-success-foreground">
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
                <h3 className="text-xl font-normal text-text-default">
                  Category
                </h3>
                <h5 className="text-sm font-normal text-foreground mt-4">
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
                <h4 className="text-xl font-normal text-text-default">
                  Impact statement
                </h4>
                <p className="text-sm text-secondary-foreground">
                  Describe this project&apos;s impact on the OP Governance from
                  Oct 1, 2023 - September 18th 2024. Please only describe the
                  impact that was delivered during that specific time period.
                </p>
                <p className="text-sm text-secondary-foreground">
                  You&apos;ve already given your project a description in your{" "}
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

                {(() => {
                  const filteredStatements = categories
                    .find((category) => category.id === watchedCategoryId)
                    ?.impactStatements.filter((impactStatement) => {
                      if (impactStatement.limitToCategoryOptions.length > 0) {
                        return watchedProjectDescriptionOptions.includes(
                          categories.find(
                            (category) => category.id === watchedCategoryId,
                          )?.options[impactStatement.limitToCategoryOptions[0]],
                        )
                      }
                      return true
                    })

                  return filteredStatements
                    ?.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))
                    .map((impactStatement) => (
                      <div key={impactStatement.id}>
                        <h6 className="text-sm font-normal">
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
                            <>
                              {impactStatement.selectionOptions?.length > 0 ? (
                                <FormItem className="space-y-2">
                                  {impactStatement.selectionOptions.map(
                                    (option) => (
                                      <div
                                        className="flex items-center space-x-2 border rounded-sm p-4"
                                        key={option}
                                      >
                                        <Checkbox
                                          id={option}
                                          checked={field.value === option}
                                          onCheckedChange={() =>
                                            field.onChange(option)
                                          }
                                        />
                                        <label
                                          htmlFor={option}
                                          className="text-sm"
                                        >
                                          {option}
                                        </label>
                                      </div>
                                    ),
                                  )}
                                </FormItem>
                              ) : (
                                <FormItem className="relative">
                                  <div className="relative">
                                    <Textarea
                                      {...field}
                                      className="min-h-60"
                                      placeholder="Add a response"
                                    />
                                    <span className="absolute bottom-2.5 left-3 text-[10px] text-muted-foreground space-x-1">
                                      <span className="font-normal">
                                        {field?.value?.length}/1000
                                      </span>
                                      <span className="text-muted-foreground">
                                        ·
                                      </span>
                                      <span>Markdown supported</span>
                                    </span>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            </>
                          )}
                        />
                      </div>
                    ))
                })()}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

const CategoryItem = ({
  category: { description, name, options, imageUrl, isMultipleChoice },
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
  return (
    <div className="p-6 border border-input rounded-xl">
      <div className=" flex items-center gap-4 ">
        <span>
          <RadioGroupItem value={value} />
        </span>

        <div>
          <h6 className="text-sm font-normal">{name}</h6>
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
        <div className="flex flex-col gap-y-1.5 pl-8 w-full">
          <h5 className="text-sm font-normal text-foreground mt-4 w-full">
            Which option describes your project?
            <span className="text-destructive">*</span>
          </h5>

          <FormField
            control={form.control}
            name={`projects.${index}.projectDescriptionOptions`}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                {/* If isMultipleChoice flag is set to false, we are going to put in
                radio boxes and then swap out the impact statements,
                else, we will show the check boxes with the same impact
                statements based on the category. */}
                {isMultipleChoice ? (
                  options.map((option) => {
                    const [title, description] = option.includes("::")
                      ? option.split("::")
                      : [option, ""]
                    return (
                      <div
                        key={option}
                        className="py-2.5 px-3 flex items-center gap-x-3 border border-input rounded-lg w-full"
                      >
                        <Checkbox
                          checked={field.value.includes(option)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, option]
                              : field.value.filter((id) => id !== option)
                            field.onChange(newValue)
                          }}
                          className=""
                        />

                        <div className="flex-grow">
                          <label
                            htmlFor={option}
                            className="text-sm font-normal"
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
                  })
                ) : (
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
                          className="py-3 px-4 flex items-center gap-x-3 border border-input rounded-lg w-full"
                        >
                          <RadioGroupItem
                            value={option}
                            id={option}
                            className="w-8 h-4"
                          />
                          <div className="flex-grow">
                            <label
                              htmlFor={option}
                              className="text-sm font-normal"
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
