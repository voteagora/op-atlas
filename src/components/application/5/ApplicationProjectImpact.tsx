import React from "react"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { Callout } from "@/components/common/Callout"
import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { ApplicationWithDetails, ProjectWithDetails } from "@/lib/types"

import { ApplicationFormSchema } from "./ApplicationFormTabs"
import ProjectImpactForm from "./ProjectImpactForm"

const ApplicationProjectImpactForm = ({
  projects,
  applications,
  form,
  onSave,
}: {
  projects?: ProjectWithDetails[]
  applications: ApplicationWithDetails[]
  form: UseFormReturn<z.infer<typeof ApplicationFormSchema>>
  onSave: () => void
}) => {
  const { fields } = useFieldArray({
    control: form.control,
    name: "projects",
  })

  const hasSelectedProjects = form
    .watch("projects")
    .some((project) => project.selected)

  return (
    <div className="flex flex-col gap-y-12">
      <div className="flex flex-col gap-y-6">
        <h4 className="text-xl font-semibold">
          Choose projects and add impact statements
        </h4>
        <p className="text-secondary-foreground">
          This part of your application helps badgeholders understand how your
          work has benefitted the Optimism Collective. If you need help,{" "}
          <ExternalLink className="underline" href="#">
            {" "}
            view our guidelines.
          </ExternalLink>
        </p>
      </div>
      <div className="flex flex-col gap-y-4">
        {!!!projects?.length && (
          <Callout
            type="error"
            text="You haven’t added or joined any projects"
            linkText="View projects"
            linkHref="/dashboard"
          />
        )}

        {/* Project Impact Form */}
        {fields.map((field, index) => (
          <ProjectImpactForm
            key={field.id}
            index={index}
            project={
              projects?.find((project) => project.id === field.projectId)!
            }
            applications={applications}
            form={form}
          />
        ))}
      </div>

      <Button
        variant="destructive"
        disabled={!hasSelectedProjects}
        onClick={onSave}
        className="disabled:bg-destructive disabled:!text-white"
      >
        Save and continue
      </Button>
    </div>
  )
}

export default ApplicationProjectImpactForm
