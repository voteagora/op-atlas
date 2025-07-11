import { useRouter } from "next/navigation"
import React from "react"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { Callout } from "@/components/common/Callout"
import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import {
  ApplicationWithDetails,
  CategoryWithImpact,
  ProjectWithDetails,
} from "@/lib/types"

import { ApplicationFormSchema } from "./ApplicationFormTabs"
import ProjectImpactForm from "./ProjectImpactForm"

const ApplicationProjectImpactForm = ({
  onNext,
  projects,
  applications,
  form,
  categories,
  isLoadingProjects,
}: {
  onNext?: () => void
  projects?: ProjectWithDetails[]
  applications: ApplicationWithDetails[]
  form: UseFormReturn<z.infer<typeof ApplicationFormSchema>>
  categories: CategoryWithImpact[]
  isLoadingProjects?: boolean
}) => {
  const { fields } = useFieldArray({
    control: form.control,
    name: "projects",
  })
  const router = useRouter()

  const hasSelectedProjects = !!form
    .watch("projects")
    .filter((project) => project.selected).length

  return (
    <div className="flex flex-col gap-y-12">
      <div className="flex flex-col gap-y-6">
        <h4 className="text-xl font-semibold">
          Choose projects and add impact statements
        </h4>
        <p className="text-secondary-foreground">
          This part of your application helps badgeholders understand how your
          work has benefitted the Optimism Collective.
        </p>
      </div>
      <div className="flex flex-col gap-y-4">
        {isLoadingProjects ? (
          <div className="flex flex-col items-center gap-2 p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-secondary-foreground">
              Loading your projects...
            </p>
          </div>
        ) : (
          <>
            {!!!projects?.length && (
              <Callout
                type="error"
                text="You haven't added or joined any projects, or none of your projects are 100% complete"
                linkText="View projects"
                linkHref="/dashboard"
              />
            )}

            {/* Project Impact Form */}
            {fields.map((field, index) => (
              <ProjectImpactForm
                categories={categories}
                key={field.id}
                index={index}
                project={
                  projects?.find((project) => project.id === field.projectId)!
                }
                form={form}
              />
            ))}
          </>
        )}
      </div>

      <Button
        variant="destructive"
        type="submit"
        disabled={
          isLoadingProjects ||
          !hasSelectedProjects ||
          !form.formState.isDirty ||
          !form.formState.isValid
        }
        className="disabled:bg-destructive disabled:!text-white"
        onClick={() => {
          onNext?.()
          router.push("/application/6?tab=application")
        }}
      >
        Save and continue
      </Button>
    </div>
  )
}

export default ApplicationProjectImpactForm
