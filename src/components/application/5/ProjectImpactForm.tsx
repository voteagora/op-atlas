import { CheckedState } from "@radix-ui/react-checkbox"
import { watch } from "fs"
import Image from "next/image"
import React, { useEffect, useMemo } from "react"
import { Controller, UseFormReturn, useWatch } from "react-hook-form"
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
import {
  ApplicationWithDetails,
  CategoryWithImpact,
  ProjectWithDetails,
} from "@/lib/types"
import { getProjectStatus } from "@/lib/utils"

const ProjectImpactForm = ({
  project,
  applications,
  categories,
  form,
  index,
}: {
  project: ProjectWithDetails
  applications: ApplicationWithDetails[]
  form: UseFormReturn<any>
  categories: CategoryWithImpact[]
  index: number
}) => {
  const isEligible = useMemo(() => {
    return getProjectStatus(project).progressPercent === 100
  }, [project])

  const hasApplied = applications[0]?.projects.findIndex(
    (p) => p.projectId === project.id,
  )

  const categoryId = form.watch(`projects.${index}.category`)

  useEffect(() => {
    const watchedProjects = form.watch("projects")
    watchedProjects.forEach((project: any, index: number) => {
      const selectedCategory = categories.find(
        (category) => category.id === project.category,
      )
      if (selectedCategory) {
        // Update the impactStatement object with new fields
        const updatedImpactStatements =
          selectedCategory.impactStatements.reduce(
            (acc: Record<string, any>, statement) => {
              acc[statement.id] = project.impactStatement[statement.id] || ""
              return acc
            },
            {},
          )
        // Update the form state with the new impactStatement structure
        form.setValue(
          `projects.${index}.impactStatement`,
          updatedImpactStatements,
        )
        form.setValue(
          `projects.${index}.projectDescription`,
          project.projectDescription || "",
        )
        form.setValue(`projects.${index}.selected`, true)
      }
    })
  }, [categories, categoryId, form])

  const isIneligible = !isEligible || hasApplied > -1

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
                    disabled={isIneligible}
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

              {hasApplied > -1 && (
                <div className="ml-auto flex items-center gap-1 py-1 px-3 rounded-full bg-success">
                  <Image
                    alt="Checkmark"
                    src="/assets/icons/circle-check-green.svg"
                    height={14}
                    width={14}
                  />
                  <p className="font-medium text-sm text-success-foreground">
                    Submitted
                  </p>
                </div>
              )}

              {isIneligible && hasApplied === -1 && (
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
                <Controller
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
                  <span className="underline">project setup</span>. There’s no
                  need to repeat that information here. Instead, focus on
                  communicating your project’s impact.
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

const CategoryItem = ({
  category: { description, name, options, imageUrl },
  value,
  selectedValue,
  form,
  index,
}: {
  selectedValue: string
  value: string
  category: CategoryWithImpact
  index: number
  form: UseFormReturn<z.infer<any>>
}) => {
  return (
    <div className="p-6 border border-input rounded-xl">
      <div className=" flex items-center gap-4 ">
        <span>
          <RadioGroupItem value={value} />
        </span>

        <div>
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
        <div className="flex flex-col gap-y-1.5 pl-8 w-full">
          <h5 className="text-sm font-medium text-foreground mt-4 w-full">
            Which option describes your project?
            <span className="text-destructive">*</span>
          </h5>

          <FormField
            control={form.control}
            name={`projects.${index}.projectDescription`}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <RadioGroup onValueChange={field.onChange} value={field.value}>
                  {options.map((option) => (
                    <div
                      key={option}
                      className="py-2.5 px-3 flex items-center gap-x-2 border border-input rounded-lg w-full"
                    >
                      <span>
                        <RadioGroupItem value={option} />
                      </span>
                      <div>
                        <p className="text-sm">{option}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}

export default ProjectImpactForm
