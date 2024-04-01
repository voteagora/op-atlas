import React from "react"
import ProjectDetails from "@/components/projects/AddProjectDetailsForm"
import ProjectFormStatusSidebar from "@/components/projects/ProjectFormStatusSidebar"

const Page = () => {
  return (
    <div className="h-full bg-secondary flex items-center justify-center py-10">
      <div className="flex items-start gap-x-10 w-3/4 mx-auto p-16 gap-12">
        <ProjectFormStatusSidebar />
        <div className="card flex-1">
          <ProjectDetails />
        </div>
      </div>
    </div>
  )
}

export default Page
