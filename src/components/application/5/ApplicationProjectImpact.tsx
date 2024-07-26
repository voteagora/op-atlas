import React from "react"

import { Callout } from "@/components/common/Callout"
import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"

import ProjectImpactForm from "./ProjectImpactForm"

const ApplicationProjectImpactForm = () => {
  return (
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
      <Callout
        type="error"
        text="You haven’t added or joined any projects"
        linkText="View projects"
        linkHref="/dashboard"
      />

      {/* Project Impact Form */}
      <ProjectImpactForm />

      <Button
        variant="destructive"
        disabled
        className="disabled:bg-destructive disabled:!text-white"
      >
        Save and continue
      </Button>
    </div>
  )
}

export default ApplicationProjectImpactForm
