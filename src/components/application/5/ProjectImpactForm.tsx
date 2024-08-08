import { CheckedState } from "@radix-ui/react-checkbox"
import Image from "next/image"
import React, { useMemo } from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import { z } from "zod"

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
import { Textarea } from "@/components/ui/textarea"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"
import { cn, getProjectStatus } from "@/lib/utils"

import { CATEGORIES } from "./ApplicationDetails"
import { ApplicationFormSchema } from "./ApplicationFormTabs"

const ProjectImpactForm = ({
  project,
  applications,

  form,
  index,
}: {
  project: ProjectWithDetails
  applications: ApplicationWithDetails[]
  form: UseFormReturn<z.infer<typeof ApplicationFormSchema>>
  index: number
}) => {
  const isEligible = useMemo(() => {
    return getProjectStatus(project).progressPercent === 100
  }, [project])

  const hasApplied = applications[0]?.projects.findIndex(
    (p) => p.projectId === project.id,
  )

  const isIneligible = !isEligible || hasApplied > -1

  return (
    <div className="p-8 border border-input rounded-xl">
      <Accordion type="single" collapsible className="w-full">
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
                    className="border-2 rounded-[2px]"
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
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="mt-12 flex flex-col gap-y-12">
              <div className="flex flex-col gap-2">
                <h5 className="text-sm font-medium">
                  Choose a category of impact for this project
                  <span className="text-destructive">*</span>
                </h5>

                <Controller
                  control={form.control}
                  name={`projects.${index}.categories`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      {CATEGORIES.map((category) => (
                        <CategoryItem
                          key={category.id}
                          checked={(field.value as string[]).includes(
                            category.id,
                          )}
                          onCheckboxChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, category.id]
                              : field.value.filter(
                                  (id: string) => id !== category.id,
                                )
                            field.onChange(newValue)
                          }}
                          title={category.title}
                          description={category.description}
                          className={category.className}
                          icon={category.icon}
                        />
                      ))}
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
                <h4 className="text-xl font-semibold">Impact statement</h4>
                <p className="text-sm">
                  Describe this project’s impact on the OP Stack from Oct 1,
                  2023 - July 31, 2024. Please only describe the impact that was
                  delivered during that specific time period.
                </p>
                <p className="text-sm">
                  You’ve already given your project a description in your
                  project setup. There’s no need to repeat that information
                  here. Instead, focus on communicating your project’s impact.
                </p>
                <Callout
                  className="!text-sm"
                  type="info"
                  text="Promises of future deliverables or impact are not allowed."
                />

                <div>
                  <h6 className="text-sm font-medium">
                    What entities or infrastructure depend on this project (Oct
                    1, 2023 - July 31, 2024)?
                    <span className="text-destructive">*</span>
                  </h6>
                  <p className="text-sm text-secondary-foreground mb-2">
                    Aka: who gets value from this project?
                  </p>

                  <FormField
                    control={form.control}
                    name={`projects.${index}.entities`}
                    render={({ field }) => (
                      <FormItem className="relative">
                        <Textarea
                          {...field}
                          className="min-h-60"
                          placeholder="Add a response"
                        />
                        <span className="absolute bottom-2.5 left-3 text-[10px] text-muted-foreground">
                          {field?.value?.length}/1000
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <h6 className="text-sm font-medium">
                    How do you measure impact and what were your results (Oct 1,
                    2023 - July 31, 2024)?
                    <span className="text-destructive">*</span>
                  </h6>
                  <p className="text-sm text-secondary-foreground mb-2">
                    Aka: what are your success metrics?
                  </p>
                  <FormField
                    name={`projects.${index}.results`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="relative">
                        <Textarea
                          {...field}
                          className="min-h-60"
                          placeholder="Add a response"
                        />
                        <span className="absolute bottom-2.5 left-3 text-[10px] text-muted-foreground">
                          {field?.value?.length}/1000
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <h6 className="text-sm font-medium">
                    Is there anything else you’d like to add?
                  </h6>
                  <FormField
                    name={`projects.${index}.additionalInfo`}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="mt-2 relative">
                        <Textarea
                          {...field}
                          className="min-h-60"
                          placeholder="Add a response"
                        />
                        <span className="absolute bottom-2.5 left-3 text-[10px] text-muted-foreground">
                          {field?.value?.length}/1000
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

const CategoryItem = ({
  checked,
  onCheckboxChange,
  title,
  description,
  icon,
  className,
}: {
  title: string
  description: string
  icon: string
  className?: string
  checked: boolean
  onCheckboxChange: (checked: CheckedState) => void
}) => {
  return (
    <div className="p-6 flex items-center gap-4 border border-input rounded-xl">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckboxChange}
        className="mt-1 border-2 rounded-[2px]"
      />
      <div>
        <h6 className="text-sm font-medium">{title}</h6>
        <p className="text-sm text-secondary-foreground">{description}</p>
      </div>
      <div
        className={cn(
          "min-w-16 h-16 flex justify-center items-center rounded-lg",
          className,
        )}
      >
        <Image src={icon} alt={title} width={16} height={18} />
      </div>
    </div>
  )
}

export default ProjectImpactForm
